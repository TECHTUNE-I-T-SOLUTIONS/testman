// app/api/notes/route.ts
import { connectdb } from "@/lib/connectdb";
import Note from "@/lib/models/note";
import { NextResponse } from "next/server";
import formidable from "formidable";
import { IncomingMessage } from "http";
import { Readable } from "stream";

// Needed to convert Web Request to Node Request
function toNodeRequest(request: Request): IncomingMessage {
  if (!request.body) {
    throw new Error("Request body is null – cannot convert to Node readable stream.");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const readable = Readable.fromWeb(request.body as any);
  const nodeRequest = Object.assign(readable, {
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
    url: request.url,
  }) as unknown as IncomingMessage;

  return nodeRequest;
}


// Helper to wrap formidable in a Promise
function parseForm(req: IncomingMessage): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({});
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export const config = {
  api: {
    bodyParser: false,
  },
};


export async function GET(req: Request) {
  try {
    await connectdb();
    const url = new URL(req.url);
    const courseId = url.searchParams.get("courseId");

    const notes = courseId
      ? await Note.find({ courseId }).populate("courseId", "name code")
      : await Note.find().populate("courseId", "name code");

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Fetch notes error:", error);
    return NextResponse.json({ message: "Failed to fetch notes" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    await connectdb();
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ message: "Note ID required" }, { status: 400 });
    }

    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Note deleted" });
  } catch (err) {
    console.error("Delete note error:", err);
    return NextResponse.json({ message: "Failed to delete note" }, { status: 500 });
  }
}

// Handle PUT request to edit an existing note (modify by uploading a new file)

export async function PUT(req: Request) {
  try {
    const nodeReq = toNodeRequest(req); // Convert to Node-compatible stream
    const { fields, files } = await parseForm(nodeReq);

    const { id, title, fileUrl, fileType } = fields;
    await connectdb();

    const note = await Note.findById(id);
    if (!note) {
      return NextResponse.json({ message: "Note not found" }, { status: 404 });
    }

    note.title = title?.toString() || note.title;
    note.fileUrl = fileUrl?.toString() || note.fileUrl;
    const rawType = fileType?.toString() || note.fileType;
    const ext = rawType.split('/')[1]; // gets 'pdf' from 'application/pdf'

    note.fileType = ext;

    if (files.file && Array.isArray(files.file)) {
      const newFilePath = files.file[0].filepath;
      note.fileUrl = newFilePath;
    }

    await note.save();
    return NextResponse.json({ message: "Note updated successfully", note });
  } catch (error) {
    console.error("Update note error:", error);
    return NextResponse.json({ message: "Failed to update note" }, { status: 500 });
  }
}