
import { NextRequest, NextResponse } from 'next/server'
import { connectdb } from '@/lib/connectdb'
import PushSubscription from '@/lib/models/push-subscription'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getStudentFromToken } from '@/utils/auth'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { getServerSession } from 'next-auth/next'

export async function POST(req: NextRequest) {
  try {
    await connectdb()

    const { endpoint } = await req.json()

    if (!endpoint) {
      return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 })
    }

    // Find and deactivate the subscription
    const subscription = await PushSubscription.findOne({ endpoint })
    
    if (subscription) {
      subscription.isActive = false
      await subscription.save()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
