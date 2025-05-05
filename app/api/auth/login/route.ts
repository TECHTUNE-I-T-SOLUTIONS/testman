import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "@/lib/models/student";
import { connectdb } from "@/lib/connectdb";

export async function POST(req: Request) {
  try {
    await connectdb();

    const { matricNumber, email, password } = await req.json();
    console.log("🔐 Login attempt:", { matricNumber, email });

    const student = await Student.findOne({ matricNumber, email });
    if (!student) {
      console.error("❌ Student not found");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, student.password);
    if (!isValidPassword) {
      console.error("❌ Incorrect password");
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // ✅ Update 'loggedIn' field in DB
    if (student.loggedIn !== "True") {
      student.loggedIn = "True";
      await student.save();
      console.log("🔄 LoggedIn status updated to True");
    }

    // ✅ Create JWT
    const token = jwt.sign(
      {
        id: student._id,
        name: student.name,
        matricNumber: student.matricNumber,
        email: student.email,
        status: student.status,
        loggedIn: student.loggedIn,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "3d" }
    );

    // ✅ Set session cookie
    const response = NextResponse.json({
      message: "Login successful",
      student: {
        id: student._id,
        name: student.name,
        matricNumber: student.matricNumber,
        email: student.email,
        status: student.status,
        loggedIn: student.loggedIn,
      },
    });

    response.headers.set(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=259200; SameSite=Strict`
    );

    console.log("✅ Login successful for:", student.email);
    return response;
  } catch (error) {
    console.error("❌ Login error:", error);
    return NextResponse.json(
      {
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
