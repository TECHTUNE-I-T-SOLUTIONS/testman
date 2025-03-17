import { NextRequest, NextResponse } from "next/server";
import Exam from "@/lib/models/exams";
import mongoose from "mongoose";
import { connectdb } from "@/lib/connectdb";

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    await connectdb();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 });
    }

    const exam = await Exam.findById(id)
      .populate("courseId", "name")
      .populate("questions");

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam, { status: 200 });
  } catch (error) {
    console.error("Error fetching exam:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    await connectdb();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { title, questions, duration, scheduledTime, isPublished } =
      await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid exam ID" }, { status: 400 });
    }

    const updatedExam = await Exam.findByIdAndUpdate(
      id,
      { title, questions, duration, scheduledTime, isPublished },
      { new: true }
    );

    if (!updatedExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exam updated successfully!", exam: updatedExam },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating exam:", error);
    return NextResponse.json(
      { message: "Failed to update exam" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    await connectdb();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid exam ID" }, { status: 400 });
    }

    const deletedExam = await Exam.findByIdAndDelete(id);

    if (!deletedExam) {
      return NextResponse.json({ message: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Exam deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting exam:", error);
    return NextResponse.json(
      { message: "Failed to delete exam" },
      { status: 500 }
    );
  }
}
