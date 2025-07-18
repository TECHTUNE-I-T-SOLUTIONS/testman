
import { NextRequest, NextResponse } from "next/server"
import PushNotification from "@/lib/models/push-notification"
import { connectdb } from "@/lib/connectdb"

export async function GET(request: NextRequest) {
  try {
    await connectdb()
    
    const notifications = await PushNotification.find()
      .sort({ sentAt: -1 })
      .limit(50)

    return NextResponse.json({ notifications })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}
