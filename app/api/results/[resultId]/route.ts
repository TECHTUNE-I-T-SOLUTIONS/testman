import { connectdb } from "@/lib/connectdb";
import NewResult from "@/lib/models/newresult";
import Exam from "@/lib/models/exams";
import Course from "@/lib/models/course";
import { NextResponse, type NextRequest } from "next/server";

type Answer = {
  questionId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
};

export async function GET(
  req: NextRequest,
  { params }: { params: { resultId: string } } // ✅ destructure here
) {
  const { resultId } = params; // ✅ now it's safe to use

  await connectdb();

  try {
    const rawResult = await NewResult.findById(resultId)
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
      .populate({
        path: "studentId",
        select: "name",
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

    return NextResponse.json({
      _id: rawResult._id,
      course: rawResult.examId?.courseId?.name || "N/A",
      examTitle: rawResult.examId?.title || "Unknown Exam",
      studentName: rawResult.studentId?.name || "Unknown Student",
      score: rawResult.score,
      totalQuestions: rawResult.totalMarks,
      createdAt: rawResult.createdAt,
      answers: (rawResult.answers as Answer[]).map((ans) => ({
        questionId: ans.questionId,
        question: ans.question,
        options: ans.options,
        correctAnswer: ans.correctAnswer,
        studentAnswer: ans.studentAnswer,
        isCorrect: ans.isCorrect,
      })),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch result" }, { status: 500 });
  }
}
