import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam, { type IAIPracticeExam } from "@/lib/models/ai-practice-exam" // Import the interface
import { getStudentFromToken } from "@/utils/auth"

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const url = new URL(req.url)
    const examId = url.searchParams.get("examId")
    const limit = Number.parseInt(url.searchParams.get("limit") || "20")
    const page = Number.parseInt(url.searchParams.get("page") || "1")

    console.log(`🔍 Fetching practice exams for student: ${student.id}`)

    if (examId) {
      // Get specific exam
      const examDoc = await AIPracticeExam.findOne({
        _id: examId,
        studentId: student.id,
      }).lean().exec()

      if (!examDoc) {
        return NextResponse.json({ error: "Exam not found" }, { status: 404 })
      }

      const exam = examDoc as unknown as IAIPracticeExam & { _id: { toString(): string } }

      console.log(`📋 Found specific exam: ${exam.title}`)

      return NextResponse.json({
        success: true,
        exam: {
          ...exam,
          id: exam._id.toString(), // Convert ObjectId to string
          questionsCount: exam.questions?.length || 0,
        },
      })
    } else {
      // Get all exams for student
      const examDocs = await AIPracticeExam.find({ studentId: student.id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .lean()
        .exec()

      const exams = examDocs as unknown as (IAIPracticeExam & { _id: { toString(): string } })[]

      const total = await AIPracticeExam.countDocuments({ studentId: student.id })

      console.log(`📊 Found ${exams.length} practice exams (total: ${total})`)

      const formattedExams = exams.map((exam) => ({
        id: exam._id.toString(), // Convert ObjectId to string
        title: exam.title,
        subject: exam.subject,
        questionsCount: exam.questions?.length || 0,
        duration: exam.duration,
        status: exam.status,
        score: exam.score,
        percentage: exam.percentage,
        createdAt: exam.createdAt,
        completedAt: exam.completedAt,
        startedAt: exam.startedAt,
      }))

      return NextResponse.json({
        success: true,
        exams: formattedExams,
        total,
        page,
        limit,
      })
    }
  } catch (error) {
    console.error("❌ Error fetching practice exams:", error)
    return NextResponse.json({ error: "Failed to fetch practice exams" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, subject, questions, duration } = await req.json()

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const practiceExam = new AIPracticeExam({
      studentId: student.id,
      title,
      subject: subject || "General",
      questions,
      duration: duration || Math.max(30, questions.length * 2),
      status: "active",
      createdAt: new Date(),
    })

    await practiceExam.save()

    return NextResponse.json({
      success: true,
      exam: {
        id: (practiceExam as { _id: { toString(): string } })._id.toString(),
        title: practiceExam.title,
        questionsCount: questions.length,
        duration: practiceExam.duration,
        status: practiceExam.status,
      },
    })
  } catch (error) {
    console.error("Error creating practice exam:", error)
    return NextResponse.json({ error: "Failed to create practice exam" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { examId } = await req.json()

    const result = await AIPracticeExam.deleteOne({
      _id: examId,
      studentId: student.id,
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting practice exam:", error)
    return NextResponse.json({ error: "Failed to delete practice exam" }, { status: 500 })
  }
}
