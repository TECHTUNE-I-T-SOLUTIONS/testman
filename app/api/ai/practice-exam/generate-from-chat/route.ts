// import { type NextRequest, NextResponse } from "next/server"
// import { connectdb } from "@/lib/connectdb"
// import AIPracticeExam from "@/lib/models/ai-practice-exam"
// import ChatSession from "@/lib/models/chat-session"
// import StudyMaterial from "@/lib/models/study-material"
// import { getStudentFromToken } from "@/utils/auth"
// import { GoogleGenerativeAI } from "@google/generative-ai"

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyA2Rrlw3ymJtUIsPq7oVydiIybR8EwHSBA")

// export async function POST(req: NextRequest) {
//   try {
//     await connectdb()

//     const student = await getStudentFromToken()
//     if (!student) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     const { sessionId, content, materialIds, examTitle } = await req.json()

//     if (!content) {
//       return NextResponse.json({ error: "Content is required" }, { status: 400 })
//     }

//     // Get the chat session
//     const session = await ChatSession.findById(sessionId)
//     if (!session || session.studentId.toString() !== student.id) {
//       return NextResponse.json({ error: "Session not found" }, { status: 404 })
//     }

//     // Get additional context from materials if provided
//     let materialsContext = ""
//     if (materialIds && materialIds.length > 0) {
//       const materials = await StudyMaterial.find({
//         _id: { $in: materialIds },
//         studentId: student.id,
//         isProcessed: true,
//       })

//       materialsContext = materials
//         .map((material) => `--- ${material.title} ---\n${material.extractedText}`)
//         .join("\n\n")
//     }

//     // Generate questions from the chat content
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" })
//     const response = await model.generateContent(
//       `Generate practice exam questions based on the following chat content and materials context: ${content}\n\n${materialsContext}`
//     )
//     const result = response.response.text()

//     const questions = result.split("\n\n").map((question) => ({
//       question,
//       options: [],
//       answer: "",
//     }))

//     // Create a new practice exam
//     const practiceExam = new AIPracticeExam({
//       studentId: student.id,
//       title: examTitle,
//       questions,
//     })

//     await practiceExam.save()

//     return NextResponse.json({ success: true, examId: practiceExam.id }, { status: 201 })
//   } catch (error) {
//     console.error("Error generating practice exam from chat:", error)
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
//   }
// }
import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import { getStudentFromToken } from "@/utils/auth"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, sessionId, studyMode } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: "No content provided" }, { status: 400 })
    }

    console.log("🔍 Generating exam from chat content for student:", student.id)

    // Generate questions using Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `Based on the following chat conversation, generate 10 multiple-choice practice exam questions. Format your response as a JSON array where each question has this structure:
{
  "id": "q1",
  "question": "Question text here",
  "type": "multiple-choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Explanation of the correct answer",
  "points": 1
}

Chat content:
${content}

Make sure questions are educational and test understanding of the topics discussed. Return only the JSON array, no additional text.`

    const response = await model.generateContent(prompt)
    const result = response.response.text()

    let questions
    try {
      // Clean the response to extract JSON
      const jsonMatch = result.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No valid JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return NextResponse.json({ error: "Failed to generate valid questions" }, { status: 500 })
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "No valid questions generated" }, { status: 500 })
    }

    // Create the practice exam
    const examTitle = `Chat-Based Practice Exam - ${new Date().toLocaleDateString()}`
    const duration = Math.max(30, questions.length * 2) // 2 minutes per question, minimum 30

    const practiceExam = new AIPracticeExam({
      studentId: student.id,
      sessionId,
      title: examTitle,
      subject: studyMode || "General",
      questions,
      duration,
      status: "active",
      createdAt: new Date(),
    })

    await practiceExam.save()

    console.log(`✅ Created practice exam from chat: ${examTitle}`)

    return NextResponse.json({
      success: true,
      examId: practiceExam._id,
      exam: {
        id: practiceExam._id,
        title: examTitle,
        questionsCount: questions.length,
        duration,
        status: "active",
      },
    })
  } catch (error) {
    console.error("❌ Error generating practice exam from chat:", error)
    return NextResponse.json({ error: "Failed to generate practice exam" }, { status: 500 })
  }
}
