
import { NextRequest, NextResponse } from 'next/server'
import { connectdb } from '@/lib/connectdb'
import PushSubscription from '@/lib/models/push-subscription'

export async function GET(req: NextRequest) {
  try {
    await connectdb()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build query
    const query: Record<string, unknown> = {}
    if (search) {
      query.userId = { $regex: search, $options: 'i' }
    }

    const subscriptions = await PushSubscription.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await PushSubscription.countDocuments(query)

    return NextResponse.json({
      subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Error fetching push subscriptions:', error)
    return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
  }
}
