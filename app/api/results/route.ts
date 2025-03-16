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

    results.forEach((result) => {
      if (!result.examId) {
        console.warn(`Missing examId for result: ${result._id}`);
      } else if (!result.examId.courseId) {
        console.warn(`Missing courseId for exam: ${result.examId._id}`);
      }
    });

    const data = results.map((result) => ({
      _id: result._id,
      course: result.examId?.courseId?.name || "N/A",
      examTitle: result.examId?.title || "Unknown Exam",
      score: result.score,
      totalQuestions: result.totalMarks,
      createdAt: result.createdAt,
    }));

    console.log("Processed Results Data:", data);
    return NextResponse.json({ results: data }, { status: 200 });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json(
      { message: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
