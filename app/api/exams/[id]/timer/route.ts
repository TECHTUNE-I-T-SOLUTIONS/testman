import { NextRequest, NextResponse } from "next/server";
import Exam from "@/lib/models/exams";
import connectdb from "@/lib/connectdb";

interface Params {
  params: Promise<{
    examId: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  await new connectdb();
  const resolvedParams = await params;
  const { examId } = resolvedParams;

  try {
    const exam = await Exam.findById(examId).select("duration");

    if (!exam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({ duration: exam.duration }, { status: 200 });
  } catch (error) {
    console.error("Error fetching exam duration:", error);
    return NextResponse.json(
      { message: "Failed to fetch exam duration" },
      { status: 500 }
    );
  }
}
