// ✅ app/api/leaderboard/full/route.ts 
import { NextResponse } from "next/server";
import { connectdb } from "@/lib/connectdb";
import NewResult from "@/lib/models/newresult";

export async function GET() {
  try {
    await connectdb();

    const fullScores = await NewResult.aggregate([
      {
        $group: {
          _id: "$studentId",
          totalScore: { $sum: "$score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 }, // ✅ Limit to top 10 scorers
      {
        $lookup: {
          from: "students", // Ensure this matches your students collection name
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
