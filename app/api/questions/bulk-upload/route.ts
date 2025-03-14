import { NextResponse } from "next/server";
import Question from "@/lib/models/question";
import connectdb from "@/lib/connectdb";

export async function POST(req: Request) {
  try {
    await connectdb();
    const { questions } = await req.json();

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    await Question.insertMany(questions);

    return NextResponse.json(
      { message: "Bulk upload successful" },
      { status: 201 }
    );
  } catch (error) {
      console.error("Error uploading bulk question status:", error); 
    return NextResponse.json(
      { message: "Error in bulk upload" },
      { status: 500 }
    );
  }
}
