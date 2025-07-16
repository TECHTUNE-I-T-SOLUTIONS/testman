import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Rrlw3ymJtUIsPq7oVydiIybR8EwHSBA")

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // For PDF files, we'll use Gemini's document processing capabilities
    if (file.type === "application/pdf") {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
          },
        },
        "Extract all text content from this PDF document. Return only the text content without any additional formatting or commentary.",
      ])

      const response = await result.response
      const text = response.text()

      return NextResponse.json({ text })
    }

    // For images, we'll use Gemini's vision capabilities
    if (file.type.startsWith("image/")) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

      const result = await model.generateContent([
        {
          inlineData: {
            data: buffer.toString("base64"),
            mimeType: file.type,
          },
        },
        "Extract and transcribe all text content from this image. If it contains handwritten notes, diagrams, or educational content, describe and transcribe everything you can see that would be useful for studying.",
      ])

      const response = await result.response
      const text = response.text()

      return NextResponse.json({ text })
    }

    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
  } catch (error) {
    console.error("Text extraction error:", error)
    return NextResponse.json({ error: "Failed to extract text from file" }, { status: 500 })
  }
}
