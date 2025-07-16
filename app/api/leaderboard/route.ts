import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose"; // ✅ Import mongoose
import { connectdb } from "@/lib/connectdb";
import NewResult from "@/lib/models/newresult";

export async function GET(req: NextRequest) {
  try {
    await connectdb();

    const url = new URL(req.url || "");
    const facultyId = url.searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json({ error: "Missing facultyId" }, { status: 400 });
    }

    const topScores = await NewResult.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $match: {
          "student.faculty": new mongoose.Types.ObjectId(facultyId)
        }
      },
      {
        $group: {
          _id: "$student._id",
          totalScore: { $sum: "$score" },
          name: { $first: "$student.name" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: 1,
          totalScore: 1
        }
      }
    ]);

    return NextResponse.json(topScores);
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
