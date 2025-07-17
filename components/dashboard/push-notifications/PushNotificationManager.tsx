"use client"

import { PushNotificationSender } from "./PushNotificationSender"

export function PushNotificationManager() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Push Notifications</h1>
          <p className="text-sm text-gray-600">Send real-time notifications to students</p>
        </div>
      </div>

      <PushNotificationSender />
    </div>
  )
}