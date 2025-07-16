// app/api/students/update-phone/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";

export async function PATCH(req: NextRequest) {
  try {
    await connectdb();

    const body = await req.json();
    const { matricNumber, phoneNumber } = body;

    if (!matricNumber || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updated = await Student.findOneAndUpdate(
      { matricNumber },
      { phoneNumber },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Phone number updated" }, { status: 200 });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
