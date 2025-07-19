import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExam from "@/lib/models/ai-practice-exam"
import Course from "@/lib/models/course"
import Student from "@/lib/models/student"

export async function GET(req: Request) {
  try {
    await connectdb()
    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get("page")) || 1
    const limit = Number(searchParams.get("limit")) || 12
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    // Add status filter
    if (status !== "all") {
      query.isActive = status === "active"
    }

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "courseId.name": { $regex: search, $options: "i" } },
        { "studentId.name": { $regex: search, $options: "i" } },
        { "studentId.matricNumber": { $regex: search, $options: "i" } }
      ]
    }

    const exams = await AIPracticeExam.find(query)
      .populate({
        path: "courseId",
        model: Course,
        select: "name"
      })
      .populate({
        path: "studentId",
        model: Student,
        select: "name matricNumber"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()

    const total = await AIPracticeExam.countDocuments(query)

    // No need to join with a separate result model; all details are in the exam document
    return NextResponse.json({
      exams,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching AI exams:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI exams" },
      { status: 500 }
    )
  }
} 