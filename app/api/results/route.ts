import { NextResponse } from "next/server";
import Result from "@/lib/models/results";
import Course from "@/lib/models/course";
import Exam from "@/lib/models/exams";
import connectdb from "@/lib/connectdb";

export async function GET(req: Request) {
  await new connectdb();
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");

  if (!studentId) {
    return NextResponse.json(
      { message: "Student ID is required" },
      { status: 400 }
    );
  }

  try {
    const results = await Result.find({ studentId })
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
      .select("score totalMarks examId createdAt");

    const data = results.map((result) => ({
      _id: result._id,
      course: result.examId.courseId.name, // Course name
      examTitle: result.examId.title, // Exam title
      score: result.score,
      totalQuestions: result.totalMarks, // Assuming this means total questions
      createdAt: result.createdAt,
    }));
    console.log(data);
    return NextResponse.json({ results: data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
