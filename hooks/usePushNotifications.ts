
"use client"

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      
      const existingSubscription = await registration.pushManager.getSubscription()
      if (existingSubscription) {
        setSubscription(existingSubscription)
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }

  const subscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      
      const vapidPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa40HvcCXvYDkv69PdFcBvnVl85b-_8L5iZKJgXPBkCtNtY3iCJCn29Zv2LwPY'

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      })

      if (response.ok) {
        setSubscription(subscription)
        setIsSubscribed(true)
        toast.success('Successfully subscribed to notifications!')
      } else {
        throw new Error('Failed to save subscription')
      }
    } catch (error) {
      console.error('Subscription failed:', error)
      toast.error('Failed to subscribe to notifications')
    }
  }

  const unsubscribe = async () => {
    if (subscription) {
      try {
        await subscription.unsubscribe()
        
        // Remove subscription from server
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })

        setSubscription(null)
        setIsSubscribed(false)
        toast.success('Successfully unsubscribed from notifications')
      } catch (error) {
        console.error('Unsubscription failed:', error)
        toast.error('Failed to unsubscribe from notifications')
      }
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
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
