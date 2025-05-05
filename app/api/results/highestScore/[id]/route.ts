// ✅ app/api/results/highestScore/[id]/route.ts
import { connectdb } from "@/lib/connectdb";
import Result from "@/lib/models/results";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    // Ensure params are awaited
    const { id } = await context.params; // Destructure with await

    await connectdb();
    const studentId = id; // Now you can safely use 'id'

    const topScore = await Result.find({ studentId })
      .sort({ score: -1 })
      .limit(1)
      .select("score")
      .lean();

    return NextResponse.json({ highestScore: topScore[0]?.score || 0 });
  } catch (error) {
    console.error("Error fetching highest score:", error);
    return NextResponse.json({ message: "Failed to fetch score" }, { status: 500 });
  }
}
