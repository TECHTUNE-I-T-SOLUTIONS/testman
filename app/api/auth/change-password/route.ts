import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import { getStudentFromToken } from "@/utils/auth";

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();

    const student = await getStudentFromToken(); // ✅ NO ARGUMENT HERE
    if (!student?.matricNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { password } = body;

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingStudent = await Student.findOne({ matricNumber: student.matricNumber });
    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const isSame = await bcrypt.compare(password, existingStudent.password);
    if (isSame) {
      return NextResponse.json({ error: "New password must be different from the old one" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    existingStudent.password = hashedPassword;
    await existingStudent.save();

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
