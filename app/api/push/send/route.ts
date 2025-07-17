
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { connectdb } from '@/lib/connectdb'
import Student from '@/lib/models/student'
import Admin from '@/lib/models/admin'
import { sendBulkPushNotifications } from '@/lib/webpush-simple'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectdb()

    // Check if user is admin
    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { title, body, url, targetType = 'all', targetIds = [] } = await req.json()

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 })
    }

    // Get target students based on targetType
    let students
    if (targetType === 'all') {
      students = await Student.find({ pushSubscription: { $exists: true, $ne: null } })
    } else if (targetType === 'specific' && targetIds.length > 0) {
      students = await Student.find({ 
        _id: { $in: targetIds },
        pushSubscription: { $exists: true, $ne: null }
      })
    } else {
      return NextResponse.json({ error: 'Invalid target configuration' }, { status: 400 })
    }

    const subscriptions = students.map(student => student.pushSubscription).filter(Boolean)

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No valid push subscriptions found' }, { status: 400 })
    }

    // Send push notifications
    const results = await sendBulkPushNotifications(subscriptions, {
      title,
      body,
      url: url || '/',
      data: { timestamp: new Date().toISOString() }
    })

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: failureCount,
      total: subscriptions.length
    })
  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}
