import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";
import Exam from "@/lib/models/exams";
import Course from "@/lib/models/course";
import { NextResponse, type NextRequest } from "next/server";
import { Types } from "mongoose";

type Params = {
  params: {
    resultId: string;
  };
};

type Answer = {
  questionId: string;
  selectedOption: string;
  correct: boolean;
};

type ResultWithExamAndCourse = {
  _id: Types.ObjectId;
  score: number;
  totalMarks: number;
  createdAt: Date;
  answers: Answer[];
  examId?: {
    title?: string;
    courseId?: {
      name?: string;
    };
  };
};

export async function GET(req: NextRequest, { params }: Params) {
  await connectdb();

  try {
    const rawResult = await Result.findById(params.resultId)
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

    if (
      !rawResult ||
      typeof rawResult !== "object" ||
      !("score" in rawResult) ||
      !("totalMarks" in rawResult) ||
      !("createdAt" in rawResult) ||
      !("answers" in rawResult)
    ) {
      return NextResponse.json({ message: "Result not found" }, { status: 404 });
    }

    const result = rawResult as unknown as ResultWithExamAndCourse;

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
