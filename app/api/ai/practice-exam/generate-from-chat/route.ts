import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import ChatSession from "@/lib/models/chat-session"
import StudyMaterial from "@/lib/models/study-material"
import { getStudentFromToken } from "@/utils/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Rrlw3ymJtUIsPq7oVydiIybR8EwHSBA")

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { sessionId, content, materialIds, examTitle } = await req.json()

    if (!sessionId || !content) {
      return NextResponse.json({ error: "Session ID and content are required" }, { status: 400 })
    }

    // Get the chat session
    const session = await ChatSession.findById(sessionId)
    if (!session || session.studentId.toString() !== student.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    // Get additional context from materials if provided
    let materialsContext = ""
    if (materialIds && materialIds.length > 0) {
      const materials = await StudyMaterial.find({
        _id: { $in: materialIds },
        studentId: student.id,
        isProcessed: true,
      })

      materialsContext = materials
        .map((material) => `--- ${material.title} ---\n${material.extractedText}`)
        .join("\n\n")
    }

    // Generate questions from the chat content
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    const response = await model.generateContent(
      `Generate practice exam questions based on the following chat content and materials context: ${content}\n\n${materialsContext}`
    )
    const result = response.response.text()

    const questions = result.split("\n\n").map((question) => ({
      question,
      options: [],
      answer: "",
    }))

    // Create a new practice exam
    const practiceExam = new AIPracticeExam({
      studentId: student.id,
      title: examTitle,
      questions,
    })

    await practiceExam.save()

    return NextResponse.json({ success: true, examId: practiceExam.id }, { status: 201 })
  } catch (error) {
    console.error("Error generating practice exam from chat:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
