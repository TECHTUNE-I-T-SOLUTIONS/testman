import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectdb from "@/lib/connectdb";


const STUDENT_COLLECTION = "students";

export async function POST(req: Request) {
  try {
    const student = await req.json();
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    const result = await db.collection(STUDENT_COLLECTION).insertOne({
      ...student,
      isActive: false, 
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    const students = await db
      .collection(STUDENT_COLLECTION)
      .aggregate([
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
        {
          $unwind: { path: "$faculty", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$level", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            matricNumber: 1,
            isActive: 1,
            faculty: { _id: "$faculty._id", name: "$faculty.name" },
            department: { _id: "$department._id", name: "$department.name" },
            level: { _id: "$level._id", name: "$level.name" },
          },
        },
      ])
      .toArray();
   console.log(students)
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}


export async function PUT(req: Request) {
  try {
    const { id, ...updateData } = await req.json();
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    await db.collection(STUDENT_COLLECTION).updateOne(
      { _id: new mongoose.Types.ObjectId(id) }, 
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    return NextResponse.json(
      { message: "Student updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    await db
      .collection(STUDENT_COLLECTION)
      .deleteOne({ _id: new mongoose.Types.ObjectId(id) }); 

    return NextResponse.json(
      { message: "Student deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
