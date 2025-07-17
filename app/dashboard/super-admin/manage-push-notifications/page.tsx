
"use client"

import { PushNotificationManager } from "@/components/dashboard/push-notifications/PushNotificationManager"

export default function ManagePushNotifications() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Push Notifications</h1>
        <p className="text-muted-foreground">
          Send push notifications to users and manage notification history.
        </p>
      </div>
      
      <PushNotificationManager />
    </div>
  )
}
