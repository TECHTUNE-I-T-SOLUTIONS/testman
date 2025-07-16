import { type NextRequest, NextResponse } from "next/server"
import { connectdb } from "@/lib/connectdb"
import AIUsage from "@/lib/models/ai-usage"
import { getStudentFromToken } from "@/utils/auth"

const DAILY_FREE_LIMIT = 15
const PREMIUM_PRICE_NGN = 2500 // ₦2,500 per month

export async function GET() {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let aiUsage = await AIUsage.findOne({ studentId: student.id })

    if (!aiUsage) {
      // Create new usage record for first-time user
      aiUsage = new AIUsage({
        studentId: student.id,
        plan: "free",
        dailyTokensUsed: 0,
        lastResetDate: new Date(),
        totalTokensUsed: 0,
      })
      await aiUsage.save()
    }

    // Check if we need to reset daily tokens (new day)
    const now = new Date()
    const lastReset = new Date(aiUsage.lastResetDate)
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    if (isNewDay) {
      aiUsage.dailyTokensUsed = 0
      aiUsage.lastResetDate = now
      await aiUsage.save()
    }

    // Check if premium has expired
    if (aiUsage.plan === "premium" && aiUsage.premiumExpiryDate && now > aiUsage.premiumExpiryDate) {
      aiUsage.plan = "free"
      aiUsage.premiumExpiryDate = undefined
      await aiUsage.save()
    }

    const canUseAI = aiUsage.plan === "premium" || aiUsage.dailyTokensUsed < DAILY_FREE_LIMIT
    const remainingTokens = aiUsage.plan === "premium" ? "unlimited" : DAILY_FREE_LIMIT - aiUsage.dailyTokensUsed

    return NextResponse.json({
      canUseAI,
      plan: aiUsage.plan,
      dailyTokensUsed: aiUsage.dailyTokensUsed,
      remainingTokens,
      totalTokensUsed: aiUsage.totalTokensUsed,
      premiumExpiryDate: aiUsage.premiumExpiryDate,
      premiumPriceNGN: PREMIUM_PRICE_NGN,
      dailyLimit: DAILY_FREE_LIMIT,
    })
  } catch (error) {
    console.error("Error checking AI usage:", error)
    return NextResponse.json({ error: "Failed to check usage" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const student = await getStudentFromToken()
    if (!student) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await req.json()

    if (action === "increment") {
      let aiUsage = await AIUsage.findOne({ studentId: student.id })

      if (!aiUsage) {
        aiUsage = new AIUsage({
          studentId: student.id,
          plan: "free",
          dailyTokensUsed: 1,
          lastResetDate: new Date(),
          totalTokensUsed: 1,
        })
      } else {
        aiUsage.dailyTokensUsed += 1
        aiUsage.totalTokensUsed += 1
      }

      await aiUsage.save()

      return NextResponse.json({ success: true, tokensUsed: aiUsage.dailyTokensUsed })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating AI usage:", error)
    return NextResponse.json({ error: "Failed to update usage" }, { status: 500 })
  }
}
