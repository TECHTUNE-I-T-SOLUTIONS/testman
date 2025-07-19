"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Calendar, Eye, EyeOff, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/dashboard/Header"

export default function CreateAnnouncementPage() {
  const [content, setContent] = useState("")
  const [duration, setDuration] = useState("")
  const [show, setShow] = useState("yes")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!content || !duration || !show) {
      toast.error("Please fill all fields")
      return
    }

    if (Number(duration) <= 0) {
      toast.error("Duration must be greater than 0")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          duration: Number(duration),
          show: show === "yes",
        }),
      })

      if (res.ok) {
        toast.success("Announcement created successfully!")
        router.push("/dashboard/super-admin/announcements/view")
      } else {
        const err = await res.json()
        toast.error(err.error || "Failed to create announcement")
      }
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const previewDays = duration ? Number(duration) : 0
  const expiryDate = previewDays > 0 ? new Date(Date.now() + previewDays * 24 * 60 * 60 * 1000) : null

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Custom style for system/dark/light mode preview backgrounds */}
      <style jsx global>{`
        .announcement-preview-bg {
          background-color: #f0f6ff;
        }
        .announcement-preview-inner {
          background-color: #fff;
        }
        .announcement-info-bg {
          background-color: #e0edff;
        }
        @media (prefers-color-scheme: dark) {
          .announcement-preview-bg {
            background-color: #172133 !important;
          }
          .announcement-preview-inner {
            background-color: #101624 !important;
          }
          .announcement-info-bg {
            background-color: #1e293b !important;
          }
        }
        html.dark .announcement-preview-bg {
          background-color: #172133 !important;
        }
        html.dark .announcement-preview-inner {
          background-color: #101624 !important;
        }
        html.dark .announcement-info-bg {
          background-color: #1e293b !important;
        }
      `}</style>
      <Header title="Create Announcement" />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Card className="bg-card border-border shadow-md transition-colors">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Plus className="h-5 w-5" />
              New Announcement
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Create a new announcement to display to students
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-foreground">Announcement Content *</Label>
              <Textarea
                id="content"
                placeholder="Enter your announcement message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground"
                maxLength={500}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Write a clear and concise message for students</span>
                <span>{content.length}/500 characters</span>
              </div>
            </div>

            {/* Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-foreground">Duration (Days) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 7"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="365"
                  className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground">How long should this announcement be visible?</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Visibility</Label>
                <Select value={show} onValueChange={setShow}>
                  <SelectTrigger className="bg-background border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-foreground border-border">
                    <SelectItem value="yes">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Visible to Students
                      </div>
                    </SelectItem>
                    <SelectItem value="no">
                      <div className="flex items-center gap-2">
                        <EyeOff className="h-4 w-4" />
                        Hidden from Students
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {show === "yes" ? "Students will see this announcement" : "This will be saved as draft"}
                </p>
              </div>
            </div>

            {/* Preview */}
            {content && (
              <div className="space-y-2">
                <Label className="text-foreground">Announcement Preview</Label>
                <Card className="border-2 border-dashed border-blue-200 dark:border-blue-900/40 announcement-preview-bg">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Student Announcement
                        </Badge>
                        <Badge
                          variant={show === "yes" ? "default" : "secondary"}
                          className={
                            "text-xs " +
                            (show === "yes"
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                              : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-200 dark:border-gray-800")
                          }
                        >
                          {show === "yes" ? "Visible" : "Hidden"}
                        </Badge>
                      </div>

                      <div className="rounded-lg p-4 border border-border announcement-preview-inner">
                        <p className="text-sm leading-relaxed text-foreground">{content}</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Posted: {new Date().toLocaleDateString()}</span>
                        </div>
                        {expiryDate && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Expires: {expiryDate.toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Duration Info */}
            {duration && Number(duration) > 0 && (
              <div className="announcement-info-bg border border-blue-200 dark:border-blue-900/40 rounded-lg p-4 transition-colors">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200 mb-2">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">Duration Information</span>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                  <p>
                    • This announcement will be visible for <strong>{duration} day(s)</strong>
                  </p>
                  {expiryDate && (
                    <p>
                      • It will automatically expire on <strong>{expiryDate.toLocaleDateString()}</strong>
                    </p>
                  )}
                  <p>• Students will see this in their dashboard and notifications</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !content || !duration}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 border-border transition-colors"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-primary-foreground mr-2" />
                  Creating Announcement...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Announcement
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
