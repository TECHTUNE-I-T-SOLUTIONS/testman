"use client"

import type React from "react"

import { useState } from "react"
import { useForm } from "react-hook-form"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Upload, FileText, ImageIcon, Video, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import Editor from "@/components/Editor"

interface FormData {
  title: string
  content: string
}

const MAX_FILE_SIZE = 20 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/webm", "video/ogg"]

export default function CreateBlogPage() {
  const router = useRouter()
  const { register, handleSubmit } = useForm<FormData>()
  const [content, setContent] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<"image" | "video" | "">("")
  const [uploading, setUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setErrorMessage("Unsupported file type. Please upload JPEG, PNG, GIF, MP4, WebM, or OGG files.")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrorMessage("File too large. Maximum size is 20MB.")
      return
    }

    const isImage = file.type.startsWith("image")
    const isVideo = file.type.startsWith("video")

    setSelectedFile(file)
    setMediaPreview(URL.createObjectURL(file))
    setMediaType(isImage ? "image" : isVideo ? "video" : "")
  }

  const onSubmit = async (data: FormData) => {
    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("title", data.title)
    formData.append("content", content)
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    try {
      const response = await fetch("/api/blog", {
        method: "POST",
        body: formData,
      })

      setUploadProgress(100)

      if (response.ok) {
        router.push("/dashboard/super-admin/blog/view")
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || "Failed to create blog post")
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred")
      console.error("Error creating blog post:", error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8 text-primary" />
          Create New Blog Post
        </h1>
        <p className="text-muted-foreground mt-1">Write and publish a new blog post with rich content and media</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Blog Content</CardTitle>
              <CardDescription>Fill in the basic information for your blog post</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Blog Title</Label>
                  <Input
                    id="title"
                    type="text"
                    {...register("title", { required: true })}
                    placeholder="Enter an engaging blog title"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Editor content={content} setContent={setContent} />
                </div>

                <Button type="submit" disabled={uploading} className="w-full" size="lg">
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Publish Blog Post
                    </>
                  )}
                </Button>

                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="w-full" />
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Media Upload
              </CardTitle>
              <CardDescription>Add an image or video to your blog post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="media">Upload Image/Video</Label>
                <Input
                  id="media"
                  type="file"
                  accept={ALLOWED_TYPES.join(",")}
                  onChange={handleMediaChange}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Max size: 20MB. Supported: JPEG, PNG, GIF, MP4, WebM, OGG
                </p>
              </div>

              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {mediaPreview && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg overflow-hidden">
                    {mediaType === "image" && (
                      <div className="relative aspect-video">
                        <Image src={mediaPreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                    {mediaType === "video" && <video src={mediaPreview} controls className="w-full aspect-video" />}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publishing Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Engaging Title</p>
                  <p className="text-muted-foreground">Write a clear, compelling title</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <ImageIcon className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Visual Content</p>
                  <p className="text-muted-foreground">Add images or videos to enhance your post</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Video className="h-4 w-4 text-primary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Rich Formatting</p>
                  <p className="text-muted-foreground">Use the editor to format your content</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
