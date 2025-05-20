// /api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import OTP from "@/lib/models/otp";
import { sendOtpEmail } from "@/lib/notifications/emailotp";

export async function POST(req: NextRequest) {
  try {
    await connectdb();

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const existingStudent = await Student.findOne({ email });
    if (!existingStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Generate a 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Set expiration time (20 minutes)
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    // Store OTP in the database
    await OTP.create({ email, code: otpCode, expiresAt });

    // Send OTP via email
    await sendOtpEmail(email, otpCode);

    return NextResponse.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
