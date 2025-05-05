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
      status, // ✅ Get the status from request body
      loggedIn, // get the login status from the request as well
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
      status: status || "Inactive", // ✅ Added status (fallback just in case)
      loggedIn: loggedIn || "False" // Added another login state here
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
