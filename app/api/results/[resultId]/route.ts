import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";
import Exam from "@/lib/models/exams";
import Course from "@/lib/models/course";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { resultId: string } }
) {
  await connectdb();
  const { resultId } = params;

  try {
    const result = await Result.findById(resultId)
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
      .lean();

    if (!result) {
      return NextResponse.json({ message: "Result not found" }, { status: 404 });
    }

    return NextResponse.json({
      _id: result._id,
      course: result.examId?.courseId?.name || "N/A",
      examTitle: result.examId?.title || "Unknown Exam",
      score: result.score,
      totalQuestions: result.totalMarks,
      createdAt: result.createdAt,
      answers: result.answers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to fetch result" },
      { status: 500 }
    );
  }
}
