import { NextResponse } from "next/server";
import Result from "@/lib/models/results";
import Course from "@/lib/models/course";
import Exam from "@/lib/models/exams";
import { connectdb } from "@/lib/connectdb";

export async function GET(req: Request) {
  await connectdb();
  const { searchParams } = new URL(req.url);

  const departmentId = searchParams.get("department");
  const studentId = searchParams.get("studentId");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const skip = (page - 1) * limit;

  try {
    // CASE 1: Fetch by Department
    if (departmentId && !studentId) {
      const results = await Result.find()
        .populate({
          path: "studentId",
          match: { department: departmentId },
          select: "name department",
        })
        .populate({
          path: "examId",
          select: "title",
        })
        .skip(skip)
        .limit(limit)
        .lean();

      const filteredResults = results.filter((result) => result.studentId);
      return NextResponse.json(filteredResults, { status: 200 });
    }

    // CASE 2: Fetch by Student
    if (studentId) {
      const results = await Result.find({ studentId })
        .populate({
          path: "examId",
          model: Exam,
          select: "title courseId questions",
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
        .skip(skip)
        .limit(limit)
        .lean();

      const totalResults = await Result.countDocuments({ studentId });
      const totalPages = Math.ceil(totalResults / limit);

      const data = results.map((result) => ({
        _id: result._id,
        studentName: result.studentId?.name || "Unknown Student",
        course: result.examId?.courseId?.name || "Unknown Course",
        examTitle: result.examId?.title || "Unknown Exam",
        score: result.score,
        totalQuestions: result.totalMarks,
        createdAt: result.createdAt,
        answers: result.answers.map((ans) => ({
          question: ans.question,
          options: ans.options,
          correctAnswer: ans.correctAnswer,
          studentAnswer: ans.studentAnswer,
          isCorrect: ans.isCorrect,
        })),
      }));

      return NextResponse.json({ results: data, totalPages }, { status: 200 });
    }

// CASE 3: Fetch All
const results = await Result.find()
  .populate({
    path: "studentId",
    select: "name department",
  })
  .populate({
    path: "examId",
    model: Exam,
    select: "title courseId questions",
    populate: {
      path: "courseId",
      model: Course,
      select: "name",
    },
  })
  .skip(skip)
  .limit(limit)
  .lean();

  const data = results.map((result) => {
    const percentage = (result.score / result.totalMarks) * 100;
    let grade = "F";
    if (percentage >= 70) grade = "A";
    else if (percentage >= 60) grade = "B";
    else if (percentage >= 50) grade = "C";
    else if (percentage >= 40) grade = "D";

    return {
      _id: result._id,
      studentId: {
        _id: result.studentId?._id || "",
        name: result.studentId?.name || "Unknown Student",
      },
      examId: {
        _id: result.examId?._id || "",
        title: result.examId?.title || "Unknown Exam",
      },
      score: result.score,
      totalMarks: result.totalMarks,
      grade,
      createdAt: result.createdAt,
      answers: result.answers.map((ans) => ({
        question: ans.question,
        options: ans.options,
        correctAnswer: ans.correctAnswer,
        studentAnswer: ans.studentAnswer,
        isCorrect: ans.isCorrect,
      })),
    };
  });

  return NextResponse.json(data, { status: 200 });


  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
