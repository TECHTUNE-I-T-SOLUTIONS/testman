import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import { getStudentFromToken } from "@/utils/auth";

// Notifications
import { sendSignupSMS } from "@/lib/notifications/welcome-sms";
import { sendCustomSMSOrWhatsApp } from "@/lib/termii";
import { sendOtpEmailTermii } from "@/lib/notifications/emailotpTermii";

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();

    const student = await getStudentFromToken();
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

    // ✅ Prepare notification content
    const name = existingStudent.name;
    const email = existingStudent.email;
    const phone = existingStudent.phoneNumber;

    const message = `Hello ${name}, your password has been changed successfully. If this wasn't you, please contact support immediately.`;

    // ✅ Send notifications in parallel
    if (phone) {
      // Send via SMS (optional welcome message)
      sendSignupSMS(phone, name).catch(err => console.error("SMS error:", err));

      // Send OTP or notification via SMS only
      sendCustomSMSOrWhatsApp(phone, message, "sms").catch(err =>
        console.error("WhatsApp/SMS error:", err)
      );
    }


    // Send via Email
    sendOtpEmailTermii(email, "Password Change Notification", message).catch(err =>
      console.error("Email error:", err)
    );

    return NextResponse.json({ message: "Password updated and notifications sent" });

  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
