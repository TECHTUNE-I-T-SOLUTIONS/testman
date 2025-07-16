import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";

// GET /api/students/by-email?email=someone@example.com
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const db = await connectdb();

    const student = await db
      .collection("students")
      .aggregate([
        { $match: { email } },
        {
          $lookup: {
            from: "faculties",
            localField: "faculty",
            foreignField: "_id",
            as: "faculty",
          },
        },
        {
          $lookup: {
            from: "departments",
            localField: "department",
            foreignField: "_id",
            as: "department",
          },
        },
        {
          $lookup: {
            from: "levels",
            localField: "level",
            foreignField: "_id",
            as: "level",
          },
        },
        { $unwind: { path: "$faculty", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$level", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            matricNumber: 1,
            isActive: 1,
            loggedIn: 1,
            status: 1,
            faculty: { _id: "$faculty._id", name: "$faculty.name" },
            department: { _id: "$department._id", name: "$department.name" },
            level: { _id: "$level._id", name: "$level.name" },
          },
        },
      ])
      .toArray();

    if (!student.length) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching student by email:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
