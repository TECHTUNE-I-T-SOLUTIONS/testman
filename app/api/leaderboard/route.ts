// /app/api/leaderboard/route.ts (for App Router)
import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";

export async function GET() {
  try {
    await connectdb();

    const topScores = await Result.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "_id",
          as: "student"
        }
      },
      {
        $unwind: "$student"
      },
      {
        $project: {
          _id: 0,
          name: "$student.name",
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
