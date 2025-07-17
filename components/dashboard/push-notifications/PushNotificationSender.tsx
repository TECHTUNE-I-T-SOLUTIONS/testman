
"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Send } from "lucide-react"

export function PushNotificationSender() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [url, setUrl] = useState('')
  const [targetType, setTargetType] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error('Title and message are required')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          url: url.trim() || '/',
          targetType,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(`Notification sent to ${data.sent} users successfully!`)
        setTitle('')
        setBody('')
        setUrl('')
      } else {
        toast.error(data.error || 'Failed to send notification')
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      toast.error('Failed to send notification')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Push Notification</CardTitle>
        <CardDescription>
          Send real-time notifications to all subscribed students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Notification Title</Label>
          <Input
            id="title"
            placeholder="e.g., New Exam Available"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">{title.length}/50 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">Message</Label>
          <Textarea
            id="body"
            placeholder="e.g., A new exam for Computer Science has been published. Click to view."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={120}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">{body.length}/120 characters</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="url">Target URL (Optional)</Label>
          <Input
            id="url"
            placeholder="e.g., /student/exams"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">URL to open when notification is clicked</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="target">Target Audience</Label>
          <Select value={targetType} onValueChange={setTargetType}>
            <SelectTrigger>
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subscribed Students</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSend}
          disabled={isLoading || !title.trim() || !body.trim()}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Notification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
