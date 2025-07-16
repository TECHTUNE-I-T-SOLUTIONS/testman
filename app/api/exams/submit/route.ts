import { NextResponse } from "next/server";
import Question from "@/lib/models/question";
import Result from "@/lib/models/results";
import { getStudentFromToken } from "@/utils/auth";
import { connectdb } from "@/lib/connectdb";

interface DetailedResult {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
}

export async function POST(req: Request) {
  await connectdb();

  const student = await getStudentFromToken();
  if (!student)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { course, answers } = await req.json();
    let score = 0;
    const detailedResults: DetailedResult[] = [];

    const questions = await Question.find({
      _id: { $in: Object.keys(answers) },
    });

    questions.forEach(
      (q: { _id: string; question: string; correctAnswer: string }) => {
        const isCorrect = answers[q._id] === q.correctAnswer;
        if (isCorrect) score += 1;

        detailedResults.push({
          question: q.question,
          correctAnswer: q.correctAnswer,
          studentAnswer: answers[q._id],
          isCorrect,
        });
      }
    );

    await Result.create({
      studentId: student.matricNumber,
      course,
      score,
      totalQuestions: questions.length,
      detailedResults,
    });

    return NextResponse.json({
      message: "Exam submitted successfully!",
      score,
      detailedResults,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Error submitting exam", error: (error as Error).message },
      { status: 500 }
    );
  }
}
