import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import StudyMaterial from "@/lib/models/study-material"
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

    const { materialIds, examType = "mixed", questionCount = 10, sessionId } = await req.json()

    if (!materialIds || materialIds.length === 0) {
      return NextResponse.json({ error: "Material IDs are required" }, { status: 400 })
    }

    // Fetch study materials
    const materials = await StudyMaterial.find({
      _id: { $in: materialIds },
      studentId: student.id,
      isProcessed: true,
    })

    if (materials.length === 0) {
      return NextResponse.json({ error: "No processed materials found" }, { status: 404 })
    }

    // Combine extracted text from all materials
    const combinedContent = materials.map(m => m.extractedText).join("\n\n")

    // Generate exam using AI
    const examData = await generateExamWithAI(combinedContent, examType, questionCount, materials[0].subject || "General")

    // Create practice exam
    const practiceExam = new AIPracticeExam({
      studentId: student.id,
      sessionId: sessionId ? sessionId : undefined,
      title: examData.title,
      subject: examData.subject,
      questions: examData.questions,
      duration: examData.duration,
      status: "active",
      materialIds: materialIds,
      createdAt: new Date(),
    })

    await practiceExam.save()

    return NextResponse.json({
      success: true,
      exam: {
        id: practiceExam._id.toString(),
        title: practiceExam.title,
        questionsCount: practiceExam.questions.length,
        duration: practiceExam.duration,
        status: practiceExam.status,
      },
    })
  } catch (error) {
    console.error("Error generating practice exam:", error)
    return NextResponse.json({ error: "Failed to generate practice exam" }, { status: 500 })
  }
}

async function generateExamWithAI(
  content: string,
  examType: string,
  questionCount: number,
  subject: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const examTypeInstructions = {
    objective: "Generate only multiple-choice questions with 4 options (A, B, C, D).",
    theory: "Generate only short-answer questions that require detailed explanations.",
    mixed: "Generate a mix of multiple-choice questions (60%) and short-answer questions (40%)."
  }

  const prompt = `You are an expert educator creating a practice exam. Based on the following study material, generate ${questionCount} questions.

${examTypeInstructions[examType as keyof typeof examTypeInstructions]}

Study Material:
${content.substring(0, 8000)} // Limit content to avoid token limits

Requirements:
- Questions should test understanding, not just memorization
- Include a mix of difficulty levels
- For multiple-choice: provide 4 options with only one correct answer
- For short-answer: provide clear, detailed explanations
- Each question should be worth 1 point
- Questions should be relevant to the material provided

Return the response in this exact JSON format:
{
  "title": "Practice Exam on [Subject]",
  "subject": "${subject}",
  "duration": ${Math.max(30, questionCount * 2)},
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Explanation of why this is correct",
      "points": 1
    }
  ]
}

Ensure the JSON is valid and complete.`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response")
    }

    const examData = JSON.parse(jsonMatch[0])
    
    // Validate and clean the data
    if (!examData.questions || !Array.isArray(examData.questions)) {
      throw new Error("Invalid exam data structure")
    }

    // Ensure all questions have required fields
    const cleanedQuestions = examData.questions.map((q: Record<string, unknown>, index: number) => ({
      id: (q.id as string) || `q${index + 1}`,
      question: (q.question as string) || "",
      type: (q.type as string) || "multiple-choice",
      options: (q.options as string[]) || [],
      correctAnswer: (q.correctAnswer as string) || "",
      explanation: (q.explanation as string) || "",
      points: (q.points as number) || 1,
    }))

    return {
      title: (examData.title as string) || `Practice Exam on ${subject}`,
      subject: (examData.subject as string) || subject,
      duration: (examData.duration as number) || Math.max(30, questionCount * 2),
      questions: cleanedQuestions,
    }
  } catch (error) {
    console.error("AI generation error:", error)
    throw new Error("Failed to generate exam with AI")
  }
}