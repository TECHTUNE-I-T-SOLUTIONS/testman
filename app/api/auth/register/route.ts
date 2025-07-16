import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import Student from "@/lib/models/student";
import { connectdb } from "@/lib/connectdb";
import { sendSignupEmail } from "@/lib/notifications/email";
// import { sendSignupSMS } from "@/lib/notifications/welcome-sms";

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
      status,
      loggedIn,
      phoneNumber, // optional
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
      status: status || "Inactive",
      loggedIn: loggedIn || "False",
      phoneNumber,
    });

    await newStudent.save();

    // ✅ Send welcome email
    try {
      await sendSignupEmail(email, name);
    } catch (err) {
      console.warn("Welcome email failed, but registration succeeded", err);
    }

    // ✅ Send welcome SMS if phone is available
    // if (phoneNumber) {
    //   try {
    //     await sendSignupSMS(phoneNumber, name);
    //   } catch (err) {
    //     console.warn("Welcome SMS failed, but registration succeeded", err);
    //   }
    // }

    // await sendSMSorWhatsAppOTP(phoneNumber, "Welcome to Operation Save My CGPA!", "whatsapp");

    return NextResponse.json(
      { message: "Student registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Registration failed", error },
      { status: 500 }
    );
  }
}
