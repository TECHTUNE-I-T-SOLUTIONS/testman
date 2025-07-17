
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
      const newSubscription = new PushSubscription({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userId,
        userType,
        isActive: true
      })
      await newSubscription.save()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/utils/auth'
import { connectdb } from '@/lib/connectdb'
import Student from '@/lib/models/student'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectdb()
    const subscription = await req.json()

    // Find the student and save their push subscription
    const student = await Student.findOne({ email: session.user.email })
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Update or add push subscription
    student.pushSubscription = subscription
    await student.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving push subscription:', error)
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 })
  }
}
