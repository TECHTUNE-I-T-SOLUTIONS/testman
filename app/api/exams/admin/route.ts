import { NextRequest, NextResponse } from "next/server";
import Exam from "@/lib/models/exams";
import Question from "@/lib/models/question";
import mongoose from "mongoose";
import connectdb from "@/lib/connectdb";

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    console.log("Received courseId:", courseId); 

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      console.error("Invalid or missing courseId:", courseId);
      return NextResponse.json(
        { error: "Invalid or missing courseId" },
        { status: 400 }
      );
    }

    const exams = await Exam.find({
      courseId: new mongoose.Types.ObjectId(courseId),
    })
      .populate("courseId", "name")
      .populate("questions");

    return NextResponse.json({ success: true, data: exams }, { status: 200 });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  await connectdb();
  try {
    const {
      courseId,
      title,
      selectedQuestions,
      duration,
      scheduledTime,
      isPublished,
    } = await req.json();

    if (!courseId || !title || !selectedQuestions?.length || !duration) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    await Question.updateMany(
      { _id: { $in: selectedQuestions } },
      { $set: { isSelectedForExam: true } }
    );

    const newExam = new Exam({
      courseId,
      title,
      questions: selectedQuestions,
      duration,
      scheduledTime: scheduledTime || null,
      isPublished: isPublished || false,
    });

    await newExam.save();

    return NextResponse.json(
      { message: "Exam created successfully!", exam: newExam },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json(
      { message: "Failed to create exam" },
      { status: 500 }
    );
  }
}
