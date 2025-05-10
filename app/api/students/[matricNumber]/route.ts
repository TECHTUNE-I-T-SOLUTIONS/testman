import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    const encodedMatricNumber = pathParts[pathParts.length - 1];
    const decodedMatricNumber = decodeURIComponent(encodedMatricNumber);

    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    const student = await db
      .collection("students")
      .aggregate([
        {
          $match: { matricNumber: decodedMatricNumber },
        },
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
            isActive: 1, // Keep as stored (boolean)
            loggedIn: 1,
            status: 1,
            faculty: { _id: "$faculty._id", name: "$faculty.name" },
            department: { _id: "$department._id", name: "$department.name" },
            level: { _id: "$level._id", name: "$level.name" },
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .toArray();

    if (!student || student.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching student by matric number:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}
