
import { NextRequest, NextResponse } from 'next/server'
import { connectdb } from '@/lib/connectdb'
import PushNotification from '@/lib/models/push-notification'
import PushSubscription from '@/lib/models/push-subscription'
import { sendNotification } from '@/lib/webpush'
import { getServerSession } from 'next-auth/next'

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, message, url, targetAudience, isScheduled, scheduledAt } = await req.json()

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 })
    }

    // Create notification record
    const notification = new PushNotification({
      title,
      message,
      url,
      targetAudience: targetAudience || 'all',
      isScheduled: isScheduled || false,
      scheduledAt: isScheduled ? new Date(scheduledAt) : null,
      createdBy: session.user.email,
      status: isScheduled ? 'scheduled' : 'sent'
    })

    await notification.save()

    if (!isScheduled) {
      // Send immediately
      await sendPushNotification(notification)
    }

    return NextResponse.json({ 
      success: true, 
      notificationId: notification._id 
    })
  } catch (error) {
    console.error('Error creating push notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function sendPushNotification(notification: any) {
  try {
    // Get subscriptions based on target audience
    let query: any = { isActive: true }
    
    if (notification.targetAudience === 'students') {
      query.userType = 'student'
    } else if (notification.targetAudience === 'admins') {
      query.userType = 'admin'
    }

    const subscriptions = await PushSubscription.find(query)
    
    const payload = {
      title: notification.title,
      body: notification.message,
      url: notification.url,
      icon: notification.icon,
      badge: notification.badge
    }

    let successCount = 0
    let failedCount = 0

    // Send to all subscriptions
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const subscription = {
            endpoint: sub.endpoint,
            keys: sub.keys
          }
          
          const result = await sendNotification(subscription as any, payload)
          
          if (result.success) {
            successCount++
            sub.lastUsed = new Date()
            await sub.save()
          } else {
            failedCount++
            // Mark subscription as inactive if it failed
            sub.isActive = false
            await sub.save()
          }
        } catch (error) {
          failedCount++
          console.error('Failed to send to subscription:', error)
        }
      })
    )

    // Update notification status
    notification.deliveryCount = successCount
    notification.sentAt = new Date()
    notification.status = successCount > 0 ? 'sent' : 'failed'
    await notification.save()

    console.log(`Push notification sent: ${successCount} successful, ${failedCount} failed`)
  } catch (error) {
    console.error('Error sending push notifications:', error)
  }
}
