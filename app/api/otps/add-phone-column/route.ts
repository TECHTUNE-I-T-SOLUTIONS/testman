// app/api/otps/add-phone-column/route.ts

import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import OTP from "@/lib/models/otp"; // Make sure your OTP model is correct

export async function GET() {
  try {
    await connectdb();

    // Update all OTP documents to add phoneNumber if it doesn't exist
    const result = await OTP.updateMany(
      { phoneNumber: { $exists: false } },
      { $set: { phoneNumber: "" } }
    );

    return NextResponse.json({
      message: `Successfully updated ${result.modifiedCount} OTP records`,
    });
  } catch (error) {
    console.error("Error updating OTPs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
