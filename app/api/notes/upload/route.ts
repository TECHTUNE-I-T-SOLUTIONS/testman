import { connectdb } from "@/lib/connectdb";
import Note from "@/lib/models/note";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectdb();
    const { courseId, title, fileUrl, fileType } = await req.json();

    if (!courseId || !title || !fileUrl || !fileType) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const newNote = await Note.create({
      courseId,
      title,
      fileUrl,
      fileType,
    });

    return NextResponse.json({ note: newNote }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Failed to upload note" }, { status: 500 });
  }
}
