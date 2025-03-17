import { NextResponse } from "next/server";
import Question from "@/lib/models/question";
import Result from "@/lib/models/results";
import { getStudentFromToken } from "@/utils/auth";
import { connectdb } from "@/lib/connectdb";
import { Option } from "@/types/types";
import Student from "@/lib/models/student";

interface DetailedResult {
  questionId: string;
  question: string;
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
  if (!student)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    const { answers } = await req.json();
    let score = 0;
    const detailedResults: DetailedResult[] = [];

    const questions = await Question.find({
      _id: { $in: Object.keys(answers) },
    });

    questions.forEach((q) => {
      const correctOption = q.options.find((opt: Option) => opt.isCorrect);
      const correctAnswer = correctOption
        ? correctOption.text
        : "No correct answer set";
      const studentAnswer = answers[q._id];

      const isCorrect = studentAnswer === correctAnswer;
      if (isCorrect) score += 1;

      detailedResults.push({
        questionId: q._id,
        question: q.questionText,
        correctAnswer,
        studentAnswer,
        isCorrect,
      });
    });
    const studentDoc = await Student.findById(student.id);

    await Result.create({
      studentId: student.id,
      examId,
      departmentId: studentDoc.department,
      score,
      totalMarks: questions.length,
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
