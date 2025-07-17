
import webpush from 'web-push'

const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  privateKey: process.env.VAPID_PRIVATE_KEY || '',
}

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  url?: string
  data?: any
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: NotificationPayload
) {
  try {
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/favicon.ico',
      badge: payload.badge || '/favicon.ico',
      url: payload.url || '/',
      data: payload.data || {}
    })

    await webpush.sendNotification(subscription, notificationPayload)
    return { success: true }
  } catch (error) {
    console.error('Error sending push notification:', error)
    return { success: false, error }
  }
}

export { webpush }
