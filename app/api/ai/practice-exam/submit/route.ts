import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import { getStudentFromToken } from "@/utils/auth"

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId, answers, timeSpent } = await req.json()

    if (!examId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Fetch the exam
    const exam = await AIPracticeExam.findOne({
      _id: examId,
      studentId: student.id,
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    if (exam.status === "completed") {
      return NextResponse.json({ error: "Exam already completed" }, { status: 400 })
    }

    // Process answers and calculate score
    const processedAnswers = exam.questions.map((question: { id: string; type: string; correctAnswer: string | boolean }) => {
      const studentAnswer = answers.find((a: { questionId: string; answer: string | boolean | string[]; timeSpent?: number }) => a.questionId === question.id)
      
      if (!studentAnswer) {
        return {
          questionId: question.id,
          answer: null,
          isCorrect: false,
          timeSpent: 0,
        }
      }

      let isCorrect = false
      
      // Check if answer is correct based on question type
      if (question.type === "multiple-choice") {
        isCorrect = studentAnswer.answer === question.correctAnswer
      } else if (question.type === "true-false") {
        isCorrect = studentAnswer.answer === question.correctAnswer
      } else if (question.type === "short-answer") {
        // For short answer, do a case-insensitive comparison
        const studentAnswerStr = String(studentAnswer.answer).toLowerCase().trim()
        const correctAnswerStr = String(question.correctAnswer).toLowerCase().trim()
        isCorrect = studentAnswerStr === correctAnswerStr
      }

      return {
        questionId: question.id,
        answer: studentAnswer.answer,
        isCorrect,
        timeSpent: studentAnswer.timeSpent || 0,
      }
    })

    // Calculate score
    const correctAnswers = processedAnswers.filter((answer: { isCorrect: boolean }) => answer.isCorrect).length
    const totalQuestions = exam.questions.length
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    // Update exam with results
    exam.studentAnswers = processedAnswers
    exam.score = score
    exam.percentage = score
    exam.timeSpent = timeSpent
    exam.status = "completed"
    exam.completedAt = new Date()
    exam.startedAt = exam.startedAt || new Date()

    await exam.save()

    return NextResponse.json({
      success: true,
      result: {
        id: exam._id.toString(),
        score,
        percentage: score,
        correctAnswers,
        totalQuestions,
        timeSpent,
        completedAt: exam.completedAt,
      },
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 })
  }
}
