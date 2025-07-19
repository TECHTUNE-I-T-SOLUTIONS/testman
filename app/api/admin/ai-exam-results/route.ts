import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIPracticeExamResult from "@/lib/models/ai-practice-exam-result"
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
    const score = searchParams.get("score") || "all"
    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}

    // Add score filter
    if (score !== "all") {
      switch (score) {
        case "excellent":
          query.percentage = { $gte: 80 }
          break
        case "good":
          query.percentage = { $gte: 60, $lt: 80 }
          break
        case "average":
          query.percentage = { $gte: 40, $lt: 60 }
          break
        case "poor":
          query.percentage = { $lt: 40 }
          break
      }
    }

    // Add search filter
    if (search) {
      query.$or = [
        { "examId.title": { $regex: search, $options: "i" } },
        { "examId.courseId.name": { $regex: search, $options: "i" } },
        { "studentId.name": { $regex: search, $options: "i" } },
        { "studentId.matricNumber": { $regex: search, $options: "i" } }
      ]
    }

    const results = await AIPracticeExamResult.find(query)
      .populate({
        path: "examId",
        model: AIPracticeExam,
        select: "title questions courseId",
        populate: {
          path: "courseId",
          model: Course,
          select: "name"
        }
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

    const total = await AIPracticeExamResult.countDocuments(query)

    return NextResponse.json({
      results,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching AI exam results:", error)
    return NextResponse.json(
      { error: "Failed to fetch AI exam results" },
      { status: 500 }
    )
  }
} 