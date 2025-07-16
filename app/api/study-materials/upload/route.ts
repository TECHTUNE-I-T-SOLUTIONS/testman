import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import StudyMaterial, { type IStudyMaterial } from "@/lib/models/study-material" // Import the interface
import StudyAnalytics from "@/lib/models/study-analytics"
import { getStudentFromToken } from "@/utils/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { TextLoader } from "langchain/document_loaders/fs/text"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { Document } from "@langchain/core/documents"
import { promises as fs } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Rrlw3ymJtUIsPq7oVydiIybR8EwHSBA")

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const subject = (formData.get("subject") as string) || "General Study"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Validate file type and size
    const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/jpg", "text/plain"]
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 10MB" }, { status: 400 })
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = file.name
    const fileType = file.type

    console.log(`📤 Uploading file: ${fileName} (${fileType})`)

    // Create a new StudyMaterial entry with 'pending' status
  const fileUrl = `data:application/${fileType};base64,${fileBuffer.toString("base64")}`

  const newMaterial = await StudyMaterial.create({
    studentId: student.id,
    title: fileName.split(".")[0],
    fileName,
    fileType,
    fileSize: file.size,
    fileUrl,                     // ✅ satisfy the schema
    subject,
    uploadDate: new Date(),
    processingStatus: "pending",
    isProcessed: false,
  })

    // Asynchronously process the file
    processFileInBackground(newMaterial._id.toString(), fileBuffer, fileType, fileName, student.id)

    return NextResponse.json({
      success: true,
      message: "File uploaded and processing started.",
      material: {
        id: newMaterial._id.toString(),
        title: newMaterial.title,
        fileName: newMaterial.fileName,
        fileType: newMaterial.fileType,
        processingStatus: newMaterial.processingStatus,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}

async function processFileInBackground(
  materialId: string,
  fileBuffer: Buffer,
  fileType: string,
  fileName: string,
  studentId: string,
) {
  try {
    await connectdb() // Reconnect if necessary for background process

    const material: IStudyMaterial | null = await StudyMaterial.findById(materialId)
    if (!material) {
      console.error(`Material with ID ${materialId} not found for processing.`)
      return
    }

    material.processingStatus = "processing"
    await material.save()
    console.log(`⚙️ Started processing for material: ${material.title}`)

    let extractedText = ""
    let docs: Document[] = []

    // Save file temporarily to disk for Langchain loaders
    const tempDir = path.join(process.cwd(), "tmp")
    await fs.mkdir(tempDir, { recursive: true }).catch(() => {}) // Ensure directory exists
    const tempFilePath = path.join(tempDir, `${uuidv4()}-${fileName}`)
    await fs.writeFile(tempFilePath, fileBuffer)

    try {
      if (fileType === "application/pdf") {
        const loader = new PDFLoader(tempFilePath)
        docs = await loader.load()
      } else if (fileType.startsWith("text/")) {
        const loader = new TextLoader(tempFilePath)
        docs = await loader.load()
      } else if (fileType.startsWith("image/")) {
        extractedText = await extractTextFromImageWithGemini(fileBuffer, fileName, fileType)
        docs = [new Document({ pageContent: extractedText, metadata: { source: fileName, type: "image" } })]
      } else {
        throw new Error("Unsupported file type for extraction.")
      }

      // Combine all page content from documents
      extractedText = docs.map((doc) => doc.pageContent).join("\n\n")

      if (!extractedText.trim()) {
        throw new Error("No text extracted from the document.")
      }

      // Split text into chunks (useful for managing large texts, even without embeddings)
      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      const chunks = await textSplitter.splitText(extractedText) // Split raw text, not documents

      // Join chunks back for the final extractedText to be saved
      // This ensures the text is within reasonable limits if it was excessively large
      material.extractedText = chunks.join("\n\n")
      material.isProcessed = true
      material.processingStatus = "completed"
      await material.save()
      console.log(`✅ Completed processing for material: ${material.title}`)

      // Update study analytics
      await updateStudyAnalyticsForUpload(studentId, material.subject || "General")
    } catch (extractionError) {
      console.error(`❌ Error during text extraction for ${fileName}:`, extractionError)
      material.processingStatus = "failed"
      material.isProcessed = false
      material.extractedText = `Error during extraction: ${
        extractionError instanceof Error ? extractionError.message : String(extractionError)
      }`
      await material.save()
    } finally {
      // Clean up the temporary file
      await fs.unlink(tempFilePath).catch((err) => console.error("Error deleting temp file:", err))
    }
  } catch (error) {
    console.error(`Fatal error in background processing for material ${materialId}:`, error)
    await StudyMaterial.findByIdAndUpdate(materialId, {
      processingStatus: "failed",
      isProcessed: false,
      extractedText: `Fatal processing error: ${error instanceof Error ? error.message : String(error)}`,
    })
  }
}

async function extractTextFromImageWithGemini(
  imageBuffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType: mimeType,
      },
    }

    const parts = [
      {
        text: "Extract all readable text from this image. Focus on academic content, notes, or document text. Return only the extracted text, without any conversational filler or formatting beyond basic newlines.",
      },
      imagePart,
    ]

    const result = await model.generateContent(parts)
    const response = await result.response
    const text = response.text()
    console.log(`🖼️ Extracted text from image ${fileName} (length: ${text.length})`)
    return text
  } catch (error) {
    console.error(`Error extracting text from image ${fileName} with Gemini:`, error)
    return `[Failed to extract text from image: ${fileName}]`
  }
}

async function updateStudyAnalyticsForUpload(studentId: string, subject: string) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const updateData: {
      $inc: { materialsUploaded: number }
      $addToSet?: { topicsStudied: string }
    } = {
      $inc: {
        materialsUploaded: 1,
      },
    }

    if (subject && subject !== "General Study") {
      // Only add if specific subject
      updateData.$addToSet = { topicsStudied: subject }
    }

    await StudyAnalytics.findOneAndUpdate({ studentId, date: today, studyMode: "materials" }, updateData, {
      upsert: true,
      new: true,
    })
    console.log("📊 Study analytics updated for material upload")
  } catch (error) {
    console.error("Error updating analytics for upload:", error)
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const courseId = url.searchParams.get("courseId")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    const filter: { studentId: string; courseId?: string } = { studentId: student.id }
    if (courseId) {
      filter.courseId = courseId
    }

    const materials = await StudyMaterial.find(filter)
      .populate("courseId", "name code")
      .sort({ uploadDate: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean() // Use lean() for faster queries if not modifying documents

    const total = await StudyMaterial.countDocuments(filter)

    return NextResponse.json({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      materials: materials.map((material: any) => ({
        id: material._id.toString(), // Convert ObjectId to string
        title: material.title,
        fileName: material.fileName,
        fileType: material.fileType,
        fileSize: material.fileSize,
        uploadDate: material.uploadDate,
        isProcessed: material.isProcessed,
        processingStatus: material.processingStatus,
        subject: material.subject,
        course: material.courseId,
        extractedText: material.extractedText ? material.extractedText.substring(0, 200) + "..." : "", // Send preview
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching materials:", error)
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 })
  }
}
