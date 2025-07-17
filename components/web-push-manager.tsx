
"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Bell, BellOff } from "lucide-react"
import { toast } from "sonner"

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HvcCXvYDkv69PdFcBvnVl85b-_8L5iZKJgXPBkCtNtY3iCJCn29Zv2LwPY'

export function WebPushManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscriptionStatus()
    }
  }, [])

  const checkSubscriptionStatus = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      }
    } catch (error) {
      console.error('Error checking subscription status:', error)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    setIsLoading(true)
    try {
      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      })

      if (response.ok) {
        setIsSubscribed(true)
        toast.success('Successfully subscribed to notifications!')
      } else {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to subscribe to notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
          await subscription.unsubscribe()
          
          // Remove subscription from server
          await fetch('/api/push/unsubscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          })
          
          setIsSubscribed(false)
          toast.success('Successfully unsubscribed from notifications')
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to unsubscribe from notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      size="sm"
      onClick={isSubscribed ? unsubscribeFromPush : subscribeToPush}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      {isSubscribed ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {isLoading ? 'Loading...' : isSubscribed ? 'Unsubscribe' : 'Enable Notifications'}
    </Button>
  )
}
