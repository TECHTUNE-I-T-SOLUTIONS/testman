import { NextRequest, NextResponse } from "next/server"
import webpush from "web-push"
import PushSubscription from "@/lib/models/push-subscription"
import PushNotification from "@/lib/models/push-notification"
import connectDB from "@/lib/connectdb"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { title, message, targetAudience = "all" } = await request.json()

    if (!title || !message) {
      return NextResponse.json(
        { error: "Title and message are required" },
        { status: 400 }
      )
    }

    // Get all active subscriptions
    const subscriptions = await PushSubscription.find({ active: true })

    if (subscriptions.length === 0) {
      return NextResponse.json(
        { message: "No active subscriptions found", recipientCount: 0 },
        { status: 200 }
      )
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon: "/Operation-save-my-CGPA-07.svg",
      badge: "/Operation-save-my-CGPA-07.svg",
    })

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription.subscription, payload)
          return { success: true, subscriptionId: subscription._id }
        } catch (error) {
          console.error("Failed to send to subscription:", error)
          // Mark subscription as inactive if it's invalid
          await PushSubscription.findByIdAndUpdate(subscription._id, { active: false })
          return { success: false, subscriptionId: subscription._id, error }
        }
      })
    )

    const successCount = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length

    // Save notification to history
    await PushNotification.create({
      title,
      message,
      targetAudience,
      recipientCount: successCount,
      sentAt: new Date()
    })

    return NextResponse.json({
      message: "Notifications sent",
      totalSubscriptions: subscriptions.length,
      successCount,
      recipientCount: successCount
    })
  } catch (error) {
    console.error("Error sending push notifications:", error)
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    )
  }
}