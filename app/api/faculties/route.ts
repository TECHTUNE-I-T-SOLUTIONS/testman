import { NextResponse } from "next/server";
import Faculty from "@/lib/models/faculty";
import mongoose from "mongoose";
import { connectdb } from "@/lib/connectdb";

export async function GET() {
  try {
    await connectdb();
    const faculties = await Faculty.find({});
    return NextResponse.json(faculties);
  } catch (error) {
    console.error("Error fetching faculties:", error);
    return NextResponse.json(
      { error: "Failed to fetch faculties" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectdb();
    const newFaculty = new Faculty(body);
    await newFaculty.save();
    return NextResponse.json(newFaculty, { status: 201 });
  } catch (error) {
    console.error("Error creating faculty:", error);
    return NextResponse.json(
      { error: "Failed to create faculty" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectdb();

    const { id, name, session } = await request.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const updatedFaculty = await Faculty.findByIdAndUpdate(
      id,
      { name, session },
      { new: true }
    );

    if (!updatedFaculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Updated successfully",
      updatedFaculty,
    });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json(
      { error: "Failed to update faculty" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    await connectdb();
    const deletedFaculty = await Faculty.findByIdAndDelete(id);

    if (!deletedFaculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting faculty:", error);
    return NextResponse.json(
      { error: "Failed to delete faculty" },
      { status: 500 }
    );
  }
}
