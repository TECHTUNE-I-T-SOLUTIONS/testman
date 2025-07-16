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

    if (!examId || !answers) {
      return NextResponse.json({ error: "Exam ID and answers are required" }, { status: 400 })
    }

    const exam = await AIPracticeExam.findOne({
      _id: examId,
      studentId: student.id,
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Calculate score
    let correctAnswers = 0
    let totalPoints = 0
    const studentAnswers = []

    for (const question of exam.questions) {
      const studentAnswer = answers[question.id]
      const isCorrect = checkAnswer(question, studentAnswer)

      studentAnswers.push({
        questionId: question.id,
        answer: studentAnswer,
        isCorrect,
        timeSpent: 0, // Could be tracked per question
      })

      if (isCorrect) {
        correctAnswers += question.points
      }
      totalPoints += question.points
    }

    const percentage = totalPoints > 0 ? Math.round((correctAnswers / totalPoints) * 100) : 0

    // Update exam with results
    exam.studentAnswers = studentAnswers
    exam.score = correctAnswers
    exam.percentage = percentage
    exam.timeSpent = timeSpent
    exam.status = "completed"
    exam.completedAt = new Date()

    await exam.save()

    return NextResponse.json({
      success: true,
      score: correctAnswers,
      totalPoints,
      percentage,
      correctAnswers: studentAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: exam.questions.length,
    })
  } catch (error) {
    console.error("Error submitting exam:", error)
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 })
  }
}

function checkAnswer(question: { type: string; correctAnswer: number | boolean | string }, studentAnswer: string | number | boolean): boolean {
  switch (question.type) {
    case "multiple-choice":
      return Number.parseInt(studentAnswer.toString()) === question.correctAnswer
    case "true-false":
      return Boolean(studentAnswer) === question.correctAnswer
    case "short-answer":
      // Simple text comparison (could be enhanced with fuzzy matching)
      return studentAnswer?.toString().toLowerCase().trim() === question.correctAnswer?.toString().toLowerCase().trim()
    default:
      return false
  }
}
