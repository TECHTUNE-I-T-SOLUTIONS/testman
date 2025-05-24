import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import OTP from "@/lib/models/otp";

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const otp = searchParams.get("otp");
    const pin_id = searchParams.get("pin_id"); // From Termii
    const pin = searchParams.get("pin");       // User-entered OTP

    // ✅ Handle Termii SMS Verification if pin_id and pin are provided
    if (pin_id && pin) {
      const verifyRes = await fetch("https://api.ng.termii.com/api/sms/otp/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          api_key: process.env.TERMII_API_KEY, // ✅ Store in .env
          pin_id,
          pin
        })
      });

      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.verified === true) {
        return NextResponse.json({ message: "SMS OTP is valid" }, { status: 200 });
      } else {
        return NextResponse.json({ error: verifyData.message || "Invalid SMS OTP" }, { status: 400 });
      }
    }

    // ✅ Handle Email OTP Verification
    if (email && otp) {
      const otpRecord = await OTP.findOne({ email, code: otp });
      if (!otpRecord) {
        return NextResponse.json({ error: "Invalid Email OTP" }, { status: 400 });
      }

      if (otpRecord.expiresAt < new Date()) {
        return NextResponse.json({ error: "Email OTP has expired" }, { status: 400 });
      }

      return NextResponse.json({ message: "Email OTP is valid" }, { status: 200 });
    }

    // 🚫 Missing required params
    return NextResponse.json({ error: "Invalid request. Provide either email & otp, or pin_id & pin." }, { status: 400 });

  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
