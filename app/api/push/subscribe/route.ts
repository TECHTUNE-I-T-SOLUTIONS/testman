import { NextRequest, NextResponse } from 'next/server'
import { connectdb } from '@/lib/connectdb'
import PushSubscription from '@/lib/models/push-subscription'
import { getStudentFromToken } from '@/utils/auth'
import { getServerSession } from 'next-auth/next'

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const subscription = await req.json()

    // Try to get student session first
    let userId = ''
    let userType = 'student'

    try {
      const student = await getStudentFromToken()
      if (student) {
        userId = student.id
        userType = 'student'
      }
    } catch {
      // If student auth fails, try admin session
      const session = await getServerSession()
      if (session?.user?.email) {
        userId = session.user.email
        userType = 'admin'
      }
    }

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint
    })

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.userId = userId
      existingSubscription.userType = userType
      existingSubscription.isActive = true
      existingSubscription.lastUsed = new Date()
      await existingSubscription.save()
    } else {
      // Create new subscription
      await PushSubscription.create({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId,
        userType,
        isActive: true,
        lastUsed: new Date()
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}