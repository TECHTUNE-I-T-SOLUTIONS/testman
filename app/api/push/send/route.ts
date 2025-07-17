import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../api/auth/[...nextauth]/route'
import { connectdb } from '@/lib/connectdb'
import Admin from '@/lib/models/admin'
import PushSubscription from '@/lib/models/push-subscription'
import webpush from '@/lib/webpush-simple'

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

    // Get target subscriptions based on targetType
    let subscriptions
    if (targetType === 'all') {
      subscriptions = await PushSubscription.find({ isActive: true })
    } else if (targetType === 'students') {
      subscriptions = await PushSubscription.find({ userType: 'student', isActive: true })
    } else if (targetType === 'specific' && targetIds.length > 0) {
      subscriptions = await PushSubscription.find({ 
        userId: { $in: targetIds },
        isActive: true
      })
    } else {
      return NextResponse.json({ error: 'Invalid target configuration' }, { status: 400 })
    }

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No valid push subscriptions found' }, { status: 400 })
    }

    // Send notifications
    const payload = JSON.stringify({
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      url: url || '/',
      timestamp: Date.now()
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: sub.keys
            },
            payload
          )

          // Update last used date
          sub.lastUsed = new Date()
          await sub.save()

          return { success: true, userId: sub.userId }
        } catch (error) {
          console.error(`Failed to send to ${sub.userId}:`, error)

          // If subscription is invalid, mark as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            sub.isActive = false
            await sub.save()
          }

          return { success: false, userId: sub.userId, error: error.message }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: subscriptions.length
    })

  } catch (error) {
    console.error('Error sending push notifications:', error)
    return NextResponse.json({ error: 'Failed to send notifications' }, { status: 500 })
  }
}