import { NextRequest, NextResponse } from "next/server";
import Exam from "@/lib/models/exams";
import { ObjectId } from "mongodb";
import connectdb from "@/lib/connectdb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectdb();

  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Exam ID" }, { status: 400 });
    }

    const { isActive } = await req.json();

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Exam status updated",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Error updating exam status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
