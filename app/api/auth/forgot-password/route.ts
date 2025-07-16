// /api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";

// ✅ Notification Imports
import { sendSignupSMS } from "@/lib/notifications/welcome-sms";
import { sendCustomSMSOrWhatsApp } from "@/lib/termii";
import { sendOtpEmailTermii } from "@/lib/notifications/emailotpTermii";

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();

    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const student = await Student.findOne({ email });
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if the new password is the same
    const isSame = await bcrypt.compare(newPassword, student.password);
    if (isSame) {
      return NextResponse.json({ error: "New password must be different from the old one" }, { status: 400 });
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json({
        error: "Password must include uppercase, lowercase, number, and special character.",
      }, { status: 400 });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    student.password = hashedPassword;
    await student.save();

    // ✅ Notifications
    const { name, phoneNumber } = student;
    const notificationMessage = `Hello ${name}, your password was successfully updated. If you did not make this change, please contact support immediately.`;

    if (phoneNumber) {
      // Send SMS
      await sendSignupSMS(phoneNumber, name);

      // Send WhatsApp or fallback SMS
      await sendCustomSMSOrWhatsApp(phoneNumber, notificationMessage, "sms");
    }

    // Send Email
    await sendOtpEmailTermii(
      email,
      "Password Change Confirmation",
      notificationMessage
    );

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
