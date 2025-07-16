import { NextResponse } from "next/server";
import Course from "@/lib/models/course";
import Level from "@/lib/models/Level";
import mongoose from "mongoose";
import { connectdb } from "@/lib/connectdb";
import Faculty from "@/lib/models/faculty";
import Department from "@/lib/models/department";

export async function GET() {
  await connectdb();
  try {
    const courses = await Course.find().populate("levelId");
    console.log("course details", courses);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectdb();

  try {
    const { name, code, facultyId, departmentId, levelId } = await req.json();

    if (!name || !code || !facultyId || !departmentId || !levelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const faculty = await Faculty.findById(facultyId);
    if (!faculty) {
      return NextResponse.json({ error: "Faculty not found" }, { status: 404 });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return NextResponse.json({ error: "Department not found" }, { status: 404 });
    }

    
    const level = await Level.findById(levelId);
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const newCourse = await Course.create({
      name,
      code,
      facultyId,
      departmentId,
      levelId,
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  await connectdb();

  try {
    const { id, name, code, facultyId, departmentId, levelId } = await req.json();

    if (!id || !name || !code || !facultyId || !departmentId || !levelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Duplicate check
    const duplicate = await Course.findOne({ name, _id: { $ne: id } });
    if (duplicate) {
      return NextResponse.json(
        { error: "Course with this name already exists" },
        { status: 409 }
      );
    }

    if (existingCourse.levelId.toString() !== levelId) {
      await Level.findByIdAndUpdate(existingCourse.levelId, {
        $pull: { courses: id },
      });
      await Level.findByIdAndUpdate(levelId, {
        $push: { courses: id },
      });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { name, code, facultyId, departmentId, levelId },
      { new: true }
    );

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}



export async function DELETE(req: Request) {
  await connectdb();

  try {
    const { id } = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await Level.findByIdAndUpdate(deletedCourse.levelId, {
      $pull: { courses: id },
    });

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
