// ✅ app/api/leaderboard/full/route.ts
import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";

export async function GET() {
  try {
    await connectdb();

    const fullScores = await Result.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      { $unwind: "$student" },
      {
        $project: {
          _id: 0,
          name: "$student.name",
          totalScore: 1
        }
      }
    ]);

    return NextResponse.json(fullScores);
  } catch (error) {
    console.error("Full leaderboard error:", error);
    return NextResponse.json({ error: "Failed to fetch full leaderboard" }, { status: 500 });
  }
}
