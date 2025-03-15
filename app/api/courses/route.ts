import { NextResponse } from "next/server";
import Course from "@/lib/models/course";
import Level from "@/lib/models/Level";
import mongoose from "mongoose";
import connectdb from "@/lib/connectdb";

export async function GET() {
  await new connectdb();
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
  await new connectdb();

  try {
    const { name, code, facultyId, departmentId, levelId } = await req.json();

    if (!name || !code || !facultyId || !departmentId || !levelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const level = await Level.findById(levelId);
    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    // Create the new course
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

// Update an existing course
export async function PUT(req: Request) {
  await new connectdb();

  try {
    const { id, name, code, facultyId, departmentId, levelId } =
      await req.json();

    if (!id || !name || !code || !facultyId || !departmentId || !levelId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if course exists
    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If the level changes, remove the course from the old level
    if (existingCourse.levelId.toString() !== levelId) {
      await Level.findByIdAndUpdate(existingCourse.levelId, {
        $pull: { courses: id },
      });
      await Level.findByIdAndUpdate(levelId, { $push: { courses: id } });
    }

    // Update the course
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

// Delete a course and remove its reference from Level
export async function DELETE(req: Request) {
  await new connectdb();

  try {
    const { id } = await req.json();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    // Find and delete course
    const deletedCourse = await Course.findByIdAndDelete(id);
    if (!deletedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Remove course reference from Level
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
