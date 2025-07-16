// File: app/api/departments/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectdb } from "@/lib/connectdb";
import Department from "@/lib/models/department";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    const department = await Department.findById(id).populate("facultyId", "name");

    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json(department, { status: 200 });
  } catch (error) {
    console.error("Error fetching department:", error);
    return NextResponse.json({ error: "Failed to fetch department" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    const body = await req.json();

    const updated = await Department.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json({ error: "Failed to update department" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectdb();
    const { id } = params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid department ID" }, { status: 400 });
    }

    const deleted = await Department.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Department deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
