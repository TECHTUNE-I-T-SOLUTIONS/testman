import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import OTP from "@/lib/models/otp"; // Make sure this model exists

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const code = searchParams.get("otp");

    if (!email || !code) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const otpRecord = await OTP.findOne({ email, code });
    if (!otpRecord) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP has expired" }, { status: 400 });
    }

    return NextResponse.json({ message: "OTP is valid" }, { status: 200 });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
