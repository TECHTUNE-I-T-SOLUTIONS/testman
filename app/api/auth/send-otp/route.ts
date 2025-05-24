import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import OTP from "@/lib/models/otp";
import { sendOtpEmail } from "@/lib/notifications/emailotp";
import { sendOtpEmailTermii } from "@/lib/notifications/emailotpTermii";
import { sendSMSorWhatsAppOTP } from "@/lib/termii";

export async function POST(req: NextRequest) {
  try {
    await connectdb();

    const { email, phoneNumber, channel = "email" } = await req.json();

    if (!channel) {
      return NextResponse.json({ error: "Channel is required" }, { status: 400 });
    }

    const contact = channel.includes("email") ? email : phoneNumber;

    if (!contact) {
      return NextResponse.json(
        { error: `${channel.includes("email") ? "Email" : "Phone number"} is required` },
        { status: 400 }
      );
    }

    // Lookup student
    const student = channel.includes("email")
      ? await Student.findOne({ email })
      : await Student.findOne({ phoneNumber });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Use Termii for SMS or WhatsApp
    if (channel === "sms" || channel === "whatsapp") {
      const result = await sendSMSorWhatsAppOTP(student.phoneNumber, channel);
      
      if (
        ["success", "200"].includes(result?.status) ||
        result?.smsStatus?.toLowerCase() === "message sent"
      ) {
        return NextResponse.json({ message: `OTP sent via ${channel}` });
      } else {
        console.error("Termii Error:", result);
        return NextResponse.json({ error: result?.message || "Failed to send OTP via Termii" }, { status: 500 });
      }
    }


    // Handle email OTPs internally
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 20 * 60 * 1000);

    await OTP.create({
      email: student.email,
      code: otpCode,
      expiresAt,
    });

    switch (channel) {
      case "email":
        await sendOtpEmail(student.email, otpCode);
        break;
      case "email2":
      await sendOtpEmailTermii(
        student.email,
        "Your OTP Code",
        `Your verification code is: ${otpCode}`
      );
        break;
      default:
        return NextResponse.json({ error: `Unsupported channel: ${channel}` }, { status: 400 });
    }

    return NextResponse.json({ message: `OTP sent via ${channel}` });

  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
