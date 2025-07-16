import { NextRequest, NextResponse } from "next/server";
import Level from "@/lib/models/Level";
import Department from "@/lib/models/department";
import { connectdb } from "@/lib/connectdb";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const departmentId = searchParams.get("departmentId");

    const isValidObjectId = (id: string | null) =>
      typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

    const levels = await Level.find(
      isValidObjectId(departmentId) ? { departmentId } : {}
    )
      .populate("departmentId", "name")
      .lean();


    if (!levels.length) {
      return NextResponse.json(
        { message: "No levels found", levels: [] }
      );
    }
    return NextResponse.json({ levels }, { status: 200 });
  } catch (error) {
    console.error("Error fetching levels:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectdb();

  try {
    const { name, departmentId } = await req.json();

    if (!name || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    const newLevel = await Level.create({ name, departmentId });

    return NextResponse.json(newLevel, { status: 201 });
  } catch (error) {
    console.error("Error creating level:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
