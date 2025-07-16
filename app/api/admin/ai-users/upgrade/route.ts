import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIUsage from "@/lib/models/ai-usage"

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const { studentId, plan } = await req.json()

    if (!studentId || !plan) {
      return NextResponse.json({ error: "Student ID and plan are required" }, { status: 400 })
    }

    const premiumExpiryDate = new Date()
    premiumExpiryDate.setMonth(premiumExpiryDate.getMonth() + 1) // 30 days from now

    const updatedUsage = await AIUsage.findOneAndUpdate(
      { studentId },
      {
        plan,
        premiumExpiryDate: plan === "premium" ? premiumExpiryDate : undefined,
        dailyTokensUsed: 0, // Reset daily usage
      },
      { new: true, upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: `User upgraded to ${plan} successfully`,
      usage: updatedUsage,
    })
  } catch (error) {
    console.error("Error upgrading user:", error)
    return NextResponse.json({ error: "Failed to upgrade user" }, { status: 500 })
  }
}
