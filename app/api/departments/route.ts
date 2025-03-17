import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Department from "@/lib/models/department";
import Faculty from "@/lib/models/faculty";
import Level from "@/lib/models/Level";
import Course from "@/lib/models/course";
import { connectdb } from "@/lib/connectdb";

export async function GET(request: Request) {
  try {
    await connectdb();
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");

    let query = {};
    if (facultyId) {
      if (!mongoose.Types.ObjectId.isValid(facultyId)) {
        return NextResponse.json(
          { error: "Invalid facultyId format" },
          { status: 400 }
        );
      }
      query = { facultyId };
    }

    const departments = await Department.find(query).populate(
      "facultyId",
      "name"
    );

    const departmentIds = departments.map((d) => d._id);
    const levels = await Level.find({
      departmentId: { $in: departmentIds },
    }).select("name departmentId");

    const levelIds = levels.map((l) => l._id);
    const courses = await Course.find({ levelId: { $in: levelIds } }).select(
      "name code levelId"
    );

    const departmentData = departments.map((dept) => ({
      ...dept.toObject(),
      levels: levels
        .filter(
          (level) => level.departmentId.toString() === dept._id.toString()
        )
        .map((level) => ({
          ...level.toObject(),
          courses: courses.filter(
            (course) => course.levelId.toString() === level._id.toString()
          ),
        })),
    }));

    return NextResponse.json(departmentData, { status: 200 });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, facultyId } = await request.json();
    await connectdb();

    if (!name || !facultyId) {
      return NextResponse.json(
        { error: "Name and facultyId are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return NextResponse.json(
        { error: "Invalid facultyId format" },
        { status: 400 }
      );
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const newDepartment = new Department({ name, facultyId });
    await newDepartment.save();

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Failed to create department" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectdb();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("id");

    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: "Invalid Department ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updatedDepartment = await Department.findByIdAndUpdate(
      departmentId,
      body,
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDepartment, { status: 200 });
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Failed to update department" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await connectdb();
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("id");

    if (!departmentId) {
      return NextResponse.json(
        { error: "Department ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return NextResponse.json(
        { error: "Invalid Department ID" },
        { status: 400 }
      );
    }

    const deletedDepartment = await Department.findByIdAndDelete(departmentId);
    if (!deletedDepartment) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Failed to delete department" },
      { status: 500 }
    );
  }
}
