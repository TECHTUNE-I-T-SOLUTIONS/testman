import { NextResponse } from "next/server"; 
import { connectdb } from "@/lib/connectdb";
import Student from "@/lib/models/student";
import jwt from "jsonwebtoken";

// Define expected JWT payload
interface JwtPayload {
  id: string;
  // Add more fields if needed from your JWT payload
}

// GET: Get currently logged-in student (from cookie/token)
export async function GET(req: Request) {
  try {
    await connectdb();
    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const student = await Student.findById(decoded.id).select("-password");

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        student: {
          id: student._id,
          name: student.name,
          email: student.email,
          matricNumber: student.matricNumber,
          status: student.status,
          loggedIn: student.loggedIn,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET student session error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve student session" },
      { status: 500 }
    );
  }
}

// PUT: Update loggedIn or status field (e.g., on logout)
export async function PUT(req: Request) {
  try {
    await connectdb();
    const { id, loggedIn, status } = await req.json();

    const student = await Student.findById(id);
    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (loggedIn !== undefined) student.loggedIn = loggedIn;
    if (status !== undefined) student.status = status;

    await student.save();
    return NextResponse.json(
      { message: "Student session info updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT student session error:", error);
    return NextResponse.json(
      { error: "Failed to update student session info" },
      { status: 500 }
    );
  }
}
