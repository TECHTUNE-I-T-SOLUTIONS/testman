import { NextResponse } from "next/server";
import Question from "@/lib/models/question";
import connectdb from "@/lib/connectdb";

export async function GET(req: Request) {
  try {
    await connectdb();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { message: "Course ID is required" },
        { status: 400 }
      );
    }

    const questions = await Question.find({ courseId });

    return NextResponse.json(questions, { status: 200 });
  } catch (error) {
      console.error("Error getting question status:", error); 
    return NextResponse.json(
      { message: "Error fetching questions" },
      { status: 500 }
    );
  }
}


export async function POST(req: Request) {
  try {
    await connectdb();
    const { courseId, questionText, options } = await req.json();

    if (!courseId || !questionText || options.length < 2) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    const question = await Question.create({ courseId, questionText, options });

    return NextResponse.json(
      { message: "Question created", question },
      { status: 201 }
    );
  } catch (error) {
      console.error("Error posting question status:", error); 
    return NextResponse.json(
      { message: "Error creating question" },
      { status: 500 }
    );
  }
}


export async function DELETE(req: Request) {
  try {
    await connectdb();
    const { id } = await req.json();

    const deletedQuestion = await Question.findByIdAndDelete(id);
    if (!deletedQuestion) {
      return NextResponse.json(
        { message: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Question deleted" }, { status: 200 });
  } catch (error) {
      console.error("Error deleting question status:", error); 
    return NextResponse.json(
      { message: "Error deleting question" },
      { status: 500 }
    );
  }
}

