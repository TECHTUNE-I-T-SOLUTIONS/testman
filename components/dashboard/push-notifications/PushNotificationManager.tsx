
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Send, Users, Bell, Trash2 } from "lucide-react"

interface PushNotification {
  _id: string
  title: string
  message: string
  targetAudience: string
  sentAt: string
  recipientCount: number
}

export function PushNotificationManager() {
  const [notifications, setNotifications] = useState<PushNotification[]>([])
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [targetAudience, setTargetAudience] = useState("all")
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/push/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setSending(true)
    try {
      const response = await fetch("/api/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          message,
          targetAudience,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(`Notification sent to ${data.recipientCount} users`)
        setTitle("")
        setMessage("")
        fetchNotifications()
      } else {
        toast.error("Failed to send notification")
      }
    } catch (error) {
      console.error("Error sending notification:", error)
      toast.error("Error sending notification")
    } finally {
      setSending(false)
    }
  }

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/push/notifications/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Notification deleted")
        fetchNotifications()
      } else {
        toast.error("Failed to delete notification")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast.error("Error deleting notification")
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      {/* Send New Notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Push Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              maxLength={50}
            />
          </div>
          
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              maxLength={200}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="audience">Target Audience</Label>
            <select
              id="audience"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="all">All Users</option>
              <option value="students">Students Only</option>
              <option value="premium">Premium Users</option>
            </select>
          </div>

          <Button 
            onClick={sendNotification} 
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full"
          >
            {sending ? "Sending..." : "Send Notification"}
          </Button>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-muted-foreground">No notifications sent yet.</p>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <Badge variant="secondary">
                        <Users className="h-3 w-3 mr-1" />
                        {notification.recipientCount}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sent: {new Date(notification.sentAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNotification(notification._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
