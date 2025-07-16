import { NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIUsage from "@/lib/models/ai-usage"

export async function GET() {
  try {
    await connectdb()

    const users = await AIUsage.find({})
      .populate("studentId", "name matricNumber email faculty department")
      .populate("studentId.faculty", "name")
      .populate("studentId.department", "name")
      .sort({ createdAt: -1 })

    const stats = {
      totalUsers: users.length,
      freeUsers: users.filter((u) => u.plan === "free").length,
      premiumUsers: users.filter((u: { plan: string }) => u.plan === "premium").length,
      totalTokensUsed: users.reduce((sum: number, u: { totalTokensUsed: number }) => sum + u.totalTokensUsed, 0),
    }

    return NextResponse.json({ users, stats })
  } catch (error) {
    console.error("Error fetching AI users:", error)
    return NextResponse.json({ error: "Failed to fetch AI users" }, { status: 500 })
  }
}
