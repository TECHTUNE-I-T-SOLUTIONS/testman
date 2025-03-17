import { NextResponse } from "next/server";
import Result from "@/lib/models/results";
import Course from "@/lib/models/course";
import Exam from "@/lib/models/exams";
import { connectdb } from "@/lib/connectdb";

export async function GET(req: Request) {
  await connectdb();
  const { searchParams } = new URL(req.url);

  const studentId = searchParams.get("studentId");
  const searchQuery = searchParams.get("search") || "";
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;

  if (!studentId) {
    return NextResponse.json(
      { message: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    const searchFilter = searchQuery
      ? {
          $or: [
            { "examId.title": { $regex: searchQuery, $options: "i" } },
            { "examId.courseId.name": { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const results = await Result.find({ studentId, ...searchFilter })
      .populate({
        path: "examId",
        model: Exam,
        select: "title courseId",
        populate: {
          path: "courseId",
          model: Course,
          select: "name",
        },
      })
      .select("score totalMarks examId createdAt")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalResults = await Result.countDocuments({
      studentId,
      ...searchFilter,
    });
    const totalPages = Math.ceil(totalResults / limit);

    const data = results.map((result) => ({
      _id: result._id,
      course: result.examId?.courseId?.name || "N/A",
      examTitle: result.examId?.title || "Unknown Exam",
      score: result.score,
      totalQuestions: result.totalMarks,
      createdAt: result.createdAt,
    }));

    return NextResponse.json({ results: data, totalPages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
