
import { NextRequest, NextResponse } from "next/server"
import PushNotification from "@/lib/models/push-notification"
import { connectdb } from "@/lib/connectdb"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectdb()
    
    await PushNotification.findByIdAndDelete(params.id)

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Error deleting notification:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
