import { NextResponse } from "next/server";
import AcademicSession from "@/lib/models/session";
import connectdb from "@/lib/connectdb";

export async function POST(req: Request) {
  try {
    const { name, startDate, endDate } = await req.json();
    await connectdb();

    const sessionExists = await AcademicSession.findOne({ name });
    if (sessionExists) {
      return NextResponse.json(
        { error: "Session already exists" },
        { status: 400 }
      );
    }

    const newSession = new AcademicSession({ name, startDate, endDate });
    await newSession.save();

    return NextResponse.json(
      { message: "Session created successfully!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error posting session status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectdb();
    const sessions = await AcademicSession.find().sort({ createdAt: -1 });
    return NextResponse.json(sessions, { status: 200 });
  } catch (error) {
    console.error("Error getting session status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const { id, name, startDate, endDate, isActive } = await req.json();
    await connectdb();

    const session = await AcademicSession.findById(id);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    session.name = name;
    session.startDate = startDate;
    session.endDate = endDate;
    session.isActive = isActive;

    await session.save();
    return NextResponse.json(
      { message: "Session updated successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating question status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await connectdb();

    await AcademicSession.findByIdAndDelete(id);
    return NextResponse.json(
      { message: "Session deleted successfully!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting question status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
