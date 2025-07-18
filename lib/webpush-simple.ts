
// eslint-disable-next-line @typescript-eslint/no-require-imports
const webpush = require('web-push');

// VAPID keys - you should generate these once and store them securely
const vapidDetails = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HvcCXvYDkv69PdFcBvnVl85b-_8L5iZKJgXPBkCtNtY3iCJCn29Zv2LwPY',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'aUgbJnJdVbKOZgHaFOgEgSF2Zc1kGwZIl8LQFUGfSoo',
  subject: process.env.VAPID_SUBJECT || 'mailto:admin@savemycgpa.com'
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
}

export async function sendPushNotification(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any,
  payload: PushNotificationPayload
) {
  try {
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || '/Operation-save-my-CGPA-09.svg',
        badge: payload.badge || '/Operation-save-my-CGPA-09.svg',
        url: payload.url || '/',
        data: payload.data || {}
      })
    );
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}

export async function sendBulkPushNotifications(
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscriptions: any[],
  payload: PushNotificationPayload
) {
  const results = [];
  for (const subscription of subscriptions) {
    try {
      const result = await sendPushNotification(subscription, payload);
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error });
    }
  }
  return results;
}

export const VAPID_PUBLIC_KEY = vapidDetails.publicKey;
