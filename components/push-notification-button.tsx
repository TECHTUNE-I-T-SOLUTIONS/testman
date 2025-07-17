
"use client"

import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"

export function PushNotificationButton() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = usePushNotifications()

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isSubscribed ? unsubscribe : subscribe}
      className="gap-2"
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          Unsubscribe
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          Subscribe to Notifications
        </>
      )}
    </Button>
  )
}
