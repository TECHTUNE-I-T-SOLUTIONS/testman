import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectdb } from "@/lib/connectdb";

const STUDENT_COLLECTION = "students";

export async function POST(req: Request) {
  try {
    const student = await req.json();
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    const result = await db.collection(STUDENT_COLLECTION).insertOne({
      ...student,
      status: false, // default status
      loggedIn: false, // stored as boolean
      isActive: false, // stored as boolean
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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email"); // Logged-in user's email

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    // Try finding in admins collection
    const admin = await db.collection("admins").findOne({ email });

    let matchCondition: Record<string, unknown> = {};

    if (admin) {
      // Admin found, apply filtering based on role
      if (admin.role === "Admin" && admin.assignedFaculty) {
        matchCondition.faculty = admin.assignedFaculty;
      } else if (admin.role === "Sub-Admin" && admin.assignedDepartment) {
        matchCondition.department = admin.assignedDepartment;
      } else if (admin.role === "super-admin") {
        matchCondition = {}; // All students
      }
    } else {
      // Not in admins, check users for super-admin
      const user = await db.collection("users").findOne({ email });

      if (!user) {
        return NextResponse.json(
          { error: "User not found in admins or users collection" },
          { status: 404 }
        );
      }

      if (user.role === "super-admin") {
        matchCondition = {}; // All students
      } else {
        return NextResponse.json(
          { error: "Unauthorized: Insufficient permissions" },
          { status: 403 }
        );
      }
    }

    const students = await db
      .collection(STUDENT_COLLECTION)
      .aggregate([
        { $match: matchCondition },
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
            phoneNumber: 1, // ✅ Added
            isActive: 1,
            loggedIn: 1,
            status: 1,
            faculty: { _id: "$faculty._id", name: "$faculty.name" },
            department: { _id: "$department._id", name: "$department.name" },
            level: { _id: "$level._id", name: "$level.name" },
          },
        }
      ])
      .toArray();

    return NextResponse.json(students, { status: 200 });

  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

// PUT: Update student's isActive status
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = await connectdb();
    if (!db) throw new Error("Database connection failed");

    // Bulk activate all
    if (body.activateAll) {
      await db.collection(STUDENT_COLLECTION).updateMany({}, {
        $set: { isActive: true, updatedAt: new Date() },
      });
      const updated = await db.collection(STUDENT_COLLECTION).find({}).toArray();
      return NextResponse.json(updated, { status: 200 });
    }

    // Bulk deactivate all
    if (body.deactivateAll) {
      await db.collection(STUDENT_COLLECTION).updateMany({}, {
        $set: { isActive: false, updatedAt: new Date() },
      });
      const updated = await db.collection(STUDENT_COLLECTION).find({}).toArray();
      return NextResponse.json(updated, { status: 200 });
    }

    // Single student update fallback
    const { id, isActive } = body;
    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required for individual update" },
        { status: 400 }
      );
    }

    const student = await db
      .collection(STUDENT_COLLECTION)
      .findOne({ _id: new mongoose.Types.ObjectId(id) });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const isActiveBool = isActive === true || isActive === "True";

    await db.collection(STUDENT_COLLECTION).updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      {
        $set: { isActive: isActiveBool, updatedAt: new Date() },
      }
    );

    return NextResponse.json(
      { message: "Student status updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating student status:", error);
    return NextResponse.json(
      { error: "Failed to update student status" },
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
