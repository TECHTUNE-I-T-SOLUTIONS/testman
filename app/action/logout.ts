"use server";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";

export async function logoutStudent() {
  const cookieStore = await cookies(); // <-- Await here
  const token = (await cookieStore).get("token")?.value;

  if (!token) return;

  try {
    await connectdb();

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };

    if (decoded?.id) {
      const student = await Student.findById(decoded.id);
      if (student) {
        student.loggedIn = "False";
        await student.save();
        console.log("✅ Student logged out:", student.email);
      }
    }
  } catch (error) {
    console.error("❌ Logout error:", error);
  }

  (await cookieStore).delete("token");
}
