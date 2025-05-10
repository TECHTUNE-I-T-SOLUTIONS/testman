// app/api/results/highestScore/[id]/route.ts
import { connectdb } from "@/lib/connectdb";
import NewResult from "@/lib/models/newresult";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = await context.params; // ✅ await params

    await connectdb();

    const topScore = await NewResult.find({ studentId: id })
      .sort({ score: -1 })
      .limit(1)
      .select("score")
      .lean();

    return NextResponse.json({ highestScore: topScore[0]?.score || 0 });
  } catch (error) {
    console.error("Error fetching highest score:", error);
    return NextResponse.json(
      { message: "Failed to fetch score" },
      { status: 500 }
    );
  }
}
