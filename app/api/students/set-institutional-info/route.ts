import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();

    const body = await req.json();
    const { matricNumber, facultyId, departmentId, levelId } = body;

    if (!matricNumber || !facultyId || !departmentId || !levelId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await Student.findOne({ matricNumber });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const hasChanges =
      student.faculty.toString() !== facultyId ||
      student.department.toString() !== departmentId ||
      student.level.toString() !== levelId;

    if (!hasChanges) {
      return NextResponse.json({ message: "No changes detected" }, { status: 200 });
    }

    student.faculty = facultyId;
    student.department = departmentId;
    student.level = levelId;

    await student.save();

    return NextResponse.json({ message: "Institutional info updated successfully" }, { status: 200 });

  } catch (err) {
    console.error("Error updating institutional info:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
