import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Student from "@/lib/models/student";
import { connectdb } from "@/lib/connectdb";

export async function POST(req: Request) {
  await connectdb();

  try {
    const {
      name,
      email,
      matricNumber,
      faculty,
      department,
      level,
      password,
      confirmPassword,
    } = await req.json();

    if (password !== confirmPassword) {
      return NextResponse.json(
        { message: "Passwords do not match" },
        { status: 400 }
      );
    }

    const existingStudent = await Student.findOne({ matricNumber });
    if (existingStudent) {
      return NextResponse.json(
        { message: "Student already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = new Student({
      name,
      email,
      matricNumber,
      faculty,
      department,
      level,
      password: hashedPassword,
    });

    await newStudent.save();
    return NextResponse.json(
      { message: "Student registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Registration failed", error },
      { status: 500 }
    );
  }
}
