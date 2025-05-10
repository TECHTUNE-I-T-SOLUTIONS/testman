import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Question from "@/lib/models/question";
import NewResult from "@/lib/models/newresult"; // your new result model
import Student from "@/lib/models/student";
import { getStudentFromToken } from "@/utils/auth";
import { connectdb } from "@/lib/connectdb";
import { Option } from "@/types/types";

interface DetailedResult {
  questionId: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  studentAnswer: string;
  isCorrect: boolean;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectdb();
  const resolvedParams = await params;
  const { id: examId } = resolvedParams;

  const student = await getStudentFromToken();
  if (!student) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { answers }: { answers: Record<string, string> } = await req.json();

    // Filter out blank answers
    const cleanedAnswers = Object.fromEntries(
      Object.entries(answers).filter(
        ([, val]) => typeof val === "string" && val.trim() !== ""
      )
    );

    const questionIds = Object.keys(cleanedAnswers).map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const questions = await Question.find({ _id: { $in: questionIds } });

    let score = 0;
    const detailedResults: DetailedResult[] = [];

    for (const q of questions) {
      const correctOption = q.options.find((opt: Option) => opt.isCorrect);
      const correctAnswer = correctOption ? correctOption.text : "";
      const studentAnswer = cleanedAnswers[q._id.toString()];
      const isCorrect = studentAnswer === correctAnswer;
      if (isCorrect) score++;

      detailedResults.push({
        questionId: q._id.toString(),
        question: q.questionText,
        options: q.options,
        correctAnswer,
        studentAnswer,
        isCorrect,
      });
    }

    const studentDoc = await Student.findById(student.id);

    await NewResult.create({
      studentId: student.id,
      examId,
      departmentId: studentDoc.department,
      score,
      totalMarks: questions.length,
      answers: detailedResults,
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
