import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import Course from "@/lib/models/course";
import Exam from "@/lib/models/exams";
import Result from "@/lib/models/results";
import Note from "@/lib/models/note";
import Question from "@/lib/models/question";

export async function GET() {
  try {
    await connectdb();

    const [students, courses, exams, results, notes, questions] = await Promise.all([
      Student.find({}),
      Course.find({}),
      Exam.find({}).lean(), // use .lean() for better performance
      Result.find({}).lean(),
      Note.find({}).lean(),
      Question.find({}).populate("courseId").lean(),
    ]);

    const totalStudents = students.length;
    const totalCourses = courses.length;
    const totalExams = exams.length;

    const now = new Date();
    const tenHoursAgo = new Date(now.getTime() - 10 * 60 * 60 * 1000);

    const activeExams = exams.filter((exam) => {
      const startTime = new Date(exam.scheduledTime || exam.createdAt || 0);
      return startTime >= tenHoursAgo && startTime <= now;
    });

    const totalScores = results.reduce((sum, r) => sum + (r.score || 0), 0);
    const averageScore = results.length > 0 ? totalScores / results.length : 0;

    const studentScoresMap = new Map();
    results.forEach((r) => {
      const id = r.studentId.toString();
      if (!studentScoresMap.has(id)) {
        studentScoresMap.set(id, []);
      }
      studentScoresMap.get(id).push(r.score);
    });

    const needingHelpIds = Array.from(studentScoresMap.entries())
      .filter(([_, scores]) => {
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        return avg < averageScore;
      })
      .map(([id]) => id);

    const needingHelpDetailsRaw = await Student.find({ _id: { $in: needingHelpIds } }).lean();

    const needingHelpDetails = needingHelpDetailsRaw.map((student) => {
      const scores = studentScoresMap.get(student._id.toString()) || [];
      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;
      return {
        ...student,
        averageScore: avgScore,
      };
    });

    const activityPool = [];

    // Exams
    exams.forEach((exam) => {
      activityPool.push({
        action: `Exam "${exam.title}" ${exam.createdAt === exam.updatedAt ? "created" : "updated"}`,
        time: new Date(exam.updatedAt || exam.createdAt).toISOString(),
        status: "success",
      });
    });

    // Notes
    notes.forEach((note) => {
      activityPool.push({
        action: `New note "${note.title}" added`,
        time: new Date(note.createdAt).toISOString(),
        status: "info",
      });
    });

    // Questions
    questions.forEach((question) => {
      const courseTitle = question.courseId?.name || "Unknown Course";
      activityPool.push({
        action: `New question added to course "${courseTitle}"`,
        time: new Date(question.createdAt).toISOString(),
        status: "info",
      });
    });

    // Students
    students.forEach((student) => {
      activityPool.push({
        action: `New student "${student.name ?? "Unknown"}" registered`,
        time: new Date(student.createdAt).toISOString(),
        status: "warning",
      });
    });

    const recentActivities = activityPool
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 10)
      .map((item, idx) => ({ id: idx + 1, ...item }));

    return NextResponse.json({
      totalStudents,
      totalCourses,
      totalExams,
      activeExams: activeExams.length,
      completedExams: totalExams - activeExams.length,
      averageScore,
      needingHelpCount: needingHelpIds.length,
      needingHelpDetails,
      recentActivities,
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
