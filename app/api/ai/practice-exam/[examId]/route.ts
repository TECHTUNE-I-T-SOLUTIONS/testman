export async function GET(
  request: Request,
  { params }: { params: { examId: string } }
) {
  try {
    await connectDB()

    const studentId = await getStudentFromToken()
    if (!studentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const exam = await AIPracticeExam.findOne({
      _id: params.examId,
      studentId
    }).lean()

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Transform exam to ensure all required fields are present
    const transformedExam = {
      _id: exam._id.toString(),
      title: exam.title || "Untitled Exam",
      subject: exam.subject || exam.title || "Practice Exam",
      questions: exam.questions || [],
      duration: exam.duration || 30,
      status: exam.status || "active",
      materialIds: exam.materialIds || [],
      createdAt: exam.createdAt || new Date().toISOString(),
      updatedAt: exam.updatedAt || new Date().toISOString()
    }

    return NextResponse.json({ exam: transformedExam })
  } catch (error) {
    console.error("Error fetching exam:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}