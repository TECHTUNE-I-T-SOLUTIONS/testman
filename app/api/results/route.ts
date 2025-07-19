import { NextResponse } from "next/server";
import NewResult from "@/lib/models/newresult";
import Course from "@/lib/models/course";
import Exam from "@/lib/models/exams";
import { connectdb } from "@/lib/connectdb";
import Question from "@/lib/models/question"; // ✅ Now it registers the schema
import Student from "@/lib/models/student";
import mongoose from "mongoose";

type Answer = {
  questionId: {
    questionText?: string;
  };
  isCorrect: boolean;
  question?: string;
  options?: string[];
  correctAnswer?: string;
  studentAnswer?: string;
};

interface ResultWithPercentage {
  _id: mongoose.Types.ObjectId;
  studentId: {
    _id: mongoose.Types.ObjectId;
    name: string;
  };
  examId: {
    _id: mongoose.Types.ObjectId;
    title: string;
    courseId: {
      _id: mongoose.Types.ObjectId;
      name: string;
    };
    duration: number;
  };
  score: number;
  totalMarks: number;
  createdAt: Date;
  answers: Answer[];
  percentage: number;
  isPassed: boolean;
}

export async function GET(req: Request) {
  await connectdb();
  const { searchParams } = new URL(req.url);

  const departmentId = searchParams.get("department");
  const studentId = searchParams.get("studentId");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 10;
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all";
  const skip = (page - 1) * limit;

  try {
    // CASE 1: Fetch by Department
    if (departmentId && !studentId) {
      const results = await NewResult.find({ departmentId })
        .populate({
          path: "studentId",
          model: Student,
          select: "name department",
        })
        .populate({
          path: "examId",
          select: "title",
        })
        .skip(skip)
        .limit(limit)
        .lean();

      return NextResponse.json(results, { status: 200 });
    }

    // CASE 2: Fetch by Student
    if (studentId) {
      // Get all results for stats calculation (without pagination)
      const allResults = await NewResult.find({ studentId })
        .populate({
          path: "examId",
          model: Exam,
          select: "title courseId duration",
          populate: {
            path: "courseId",
            model: Course,
            select: "name",
          },
        })
        .populate({
          path: "studentId",
          model: Student,
          select: "name",
        })
        .populate({
          path: "answers.questionId",
          select: "questionText",
        })
        .lean();

      // Calculate percentages and apply filters
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const resultsWithPercentages: ResultWithPercentage[] = allResults.map((result: any) => {
        const percentage = (result.score / result.totalMarks) * 100;
        return {
          _id: result._id,
          studentId: result.studentId,
          examId: result.examId,
          score: result.score,
          totalMarks: result.totalMarks,
          createdAt: result.createdAt,
          answers: result.answers,
          percentage,
          isPassed: percentage >= 50 // 50% is passing threshold
        };
      });

      // Apply filter
      let filteredResults = resultsWithPercentages;
      if (filter === "passed") {
        filteredResults = resultsWithPercentages.filter(r => r.isPassed);
      } else if (filter === "failed") {
        filteredResults = resultsWithPercentages.filter(r => !r.isPassed);
      }

      // Apply search filter
      if (search) {
        filteredResults = filteredResults.filter(result => 
          (result.examId && 'title' in result.examId && result.examId.title?.toLowerCase().includes(search.toLowerCase())) ||
          (result.examId && 'courseId' in result.examId && result.examId.courseId?.name?.toLowerCase().includes(search.toLowerCase()))
        );
      }

      // Calculate stats based on filtered results
      const percentages = filteredResults.map(r => r.percentage);
      const totalExams = percentages.length;
      const averageScore = totalExams > 0 ? percentages.reduce((a, b) => a + b, 0) / totalExams : 0;
      const highestScore = totalExams > 0 ? Math.max(...percentages) : 0;
      const lowestScore = totalExams > 0 ? Math.min(...percentages) : 0;

      const stats = {
        totalExams,
        averageScore,
        highestScore,
        lowestScore,
      };

      // Apply pagination to filtered results
      const paginatedResults = filteredResults.slice(skip, skip + limit);
      const totalPages = Math.ceil(filteredResults.length / limit);

      const data = paginatedResults.map((result) => ({
        _id: result._id,
        studentName: result.studentId?.name || "Unknown Student",
        course: result.examId?.courseId?.name || "Unknown Course",
        examTitle: result.examId?.title || "Unknown Exam",
        score: result.score,
        totalQuestions: result.totalMarks,
        date: result.createdAt,
        duration: result.examId?.duration || 0,
        percentage: result.percentage,
        isPassed: result.isPassed,
        answers: (result.answers as Answer[]).map((ans) => ({
          questionId: {
            questionText: ans.questionId?.questionText || "Unknown Question",
          },
          isCorrect: ans.isCorrect,
        })),
      }));

      return NextResponse.json({ results: data, totalPages, stats }, { status: 200 });
    }

    // CASE 3: Fetch All
    const results = await NewResult.find()
      .populate({
        path: "studentId",
        model: Student,
        select: "name department",
      })
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
        path: "answers.questionId",
        model: Question,
        select: "questionText",
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
        answers: (result.answers as Answer[]).map((ans) => ({
          questionId: ans.questionId,
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
