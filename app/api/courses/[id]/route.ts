import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Course from "@/lib/models/course";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectdb();
  const courseId = params.id;

  try {
    const data = await req.json();

    const updatedCourse = await Course.findByIdAndUpdate(courseId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}
