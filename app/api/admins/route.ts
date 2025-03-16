import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Admin from "@/lib/models/admin";
import { hashPassword } from "@/lib/utils";
import connectdb from "@/lib/connectdb";

export async function GET() {
  try {
    await new connectdb();
    const admins = await Admin.find();
    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch admins" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const {
      matricNumber,
      email,
      password,
      role,
      assignedFaculty,
      assignedDepartment,
    } = await req.json();

    if (!["Admin", "Sub-Admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified" },
        { status: 400 }
      );
    }

    if (role === "Admin" && !assignedFaculty) {
      return NextResponse.json(
        { error: "Admin must be assigned to a faculty" },
        { status: 400 }
      );
    }
    if (role === "Sub-Admin" && !assignedDepartment) {
      return NextResponse.json(
        { error: "Sub-Admin must be assigned to a department" },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    await new connectdb();

    const newAdmin = new Admin({
      matricNumber,
      email,
      password: hashedPassword,
      role,
      assignedFaculty:
        role === "Admin" ? new mongoose.Types.ObjectId(assignedFaculty) : null,
      assignedDepartment:
        role === "Sub-Admin"
          ? new mongoose.Types.ObjectId(assignedDepartment)
          : null,
    });

    await newAdmin.save();
    return NextResponse.json(
      { id: newAdmin._id, message: "Admin created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding admin:", error);
    return NextResponse.json({ error: "Failed to add admin" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, ...updatedData } = await req.json();
    await new connectdb();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    await Admin.findByIdAndUpdate(new mongoose.Types.ObjectId(id), updatedData);
    return NextResponse.json(
      { message: "Admin updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating admin:", error);
    return NextResponse.json(
      { error: "Failed to update admin" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await new connectdb();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid admin ID" }, { status: 400 });
    }

    await Admin.findByIdAndDelete(new mongoose.Types.ObjectId(id));
    return NextResponse.json(
      { message: "Admin deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting admin:", error);
    return NextResponse.json(
      { error: "Failed to delete admin" },
      { status: 500 }
    );
  }
}
