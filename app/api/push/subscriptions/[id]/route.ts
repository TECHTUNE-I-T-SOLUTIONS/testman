
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { connectdb } from '@/lib/connectdb'
import Admin from '@/lib/models/admin'
import PushSubscription from '@/lib/models/push-subscription'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession({ req, ...authOptions })
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectdb()

    // Check if user is admin
    const admin = await Admin.findOne({ email: session.user.email })
    if (!admin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { isActive } = await req.json()
    const { id } = params

    const subscription = await PushSubscription.findById(id)
    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    subscription.isActive = isActive
    await subscription.save()

    return NextResponse.json({ success: true, subscription })

  } catch (error) {
    console.error('Error updating push subscription:', error)
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
  }
}
