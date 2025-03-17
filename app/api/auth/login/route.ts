import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "@/lib/models/student";
import {connectdb} from "@/lib/connectdb";

export async function POST(req: Request) {
  try {
    await connectdb();

    const { matricNumber, email, password } = await req.json();
    console.log("Received login data:", { matricNumber, email });

    const student = await Student.findOne({ matricNumber, email });
    if (!student) {
      console.error("❌ Student not found.");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      console.error("❌ Invalid password.");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      {
        id: student._id,
        name: student.name,
        matricNumber: student.matricNumber,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );

    const response = NextResponse.json({ message: "Login successful" });
    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`
    );

    console.log("✅ Login successful!");
    return response;
  } catch (error) {
    console.error("❌ Error during login:", error);
    return NextResponse.json(
      {
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
