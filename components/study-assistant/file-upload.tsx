"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ImageIcon, Loader2, CheckCircle, XCircle, UploadCloud, RefreshCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface UploadedFile {
  id: string
  title: string
  fileName: string
  fileType: string
  processingStatus: "pending" | "processing" | "completed" | "failed"
  uploadProgress: number
  extractedText?: string // To show a preview of extracted text
}

interface FileUploadProps {
  onFilesUpdated: (files: UploadedFile[]) => void
}

export function FileUpload({ onFilesUpdated }: FileUploadProps) {
  const { toast } = useToast()
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [subject, setSubject] = useState("")

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast({
          title: "No files selected",
          description: "Please select a file to upload.",
          variant: "default",
        })
        return
      }

      const newFilesToAdd: UploadedFile[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(2, 15), // Temporary ID
        title: file.name.split(".")[0],
        fileName: file.name,
        fileType: file.type,
        processingStatus: "pending",
        uploadProgress: 0,
      }))

      setFiles((prevFiles) => [...prevFiles, ...newFilesToAdd])
      onFilesUpdated([...files, ...newFilesToAdd]) // Immediately update parent

      for (const file of acceptedFiles) {
        await uploadFile(file, newFilesToAdd.find((f) => f.fileName === file.name)?.id || "")
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [toast, onFilesUpdated, files],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const uploadFile = async (file: File, tempId: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subject", subject)

    try {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/study-materials/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total)
          setFiles((prevFiles) =>
            prevFiles.map((f) => (f.id === tempId ? { ...f, uploadProgress: percentCompleted } : f)),
          )
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          const materialId = response.material.id

          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === tempId
                ? {
                    ...f,
                    id: materialId, // Update with actual ID from backend
                    processingStatus: "pending",
                    uploadProgress: 100,
                  }
                : f,
            ),
          )
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded. Processing started...`,
            variant: "default",
          })
          pollProcessingStatus(materialId)
        } else {
          const errorData = JSON.parse(xhr.responseText)
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === tempId
                ? { ...f, processingStatus: "failed", uploadProgress: 100, extractedText: errorData.error }
                : f,
            ),
          )
          toast({
            title: "Upload Failed",
            description: errorData.error || `Failed to upload ${file.name}.`,
            variant: "destructive",
          })
        }
        onFilesUpdated(files.map((f) => (f.id === tempId ? { ...f, uploadProgress: 100 } : f)))
      }

      xhr.onerror = () => {
        setFiles((prevFiles) =>
          prevFiles.map((f) =>
            f.id === tempId
              ? { ...f, processingStatus: "failed", uploadProgress: 100, extractedText: "Network error" }
              : f,
          ),
        )
        toast({
          title: "Upload Failed",
          description: `Network error during upload of ${file.name}.`,
          variant: "destructive",
        })
        onFilesUpdated(files.map((f) => (f.id === tempId ? { ...f, uploadProgress: 100 } : f)))
      }

      xhr.send(formData)
    } catch (error) {
      console.error("Error during file upload:", error)
      setFiles((prevFiles) =>
        prevFiles.map((f) =>
          f.id === tempId
            ? { ...f, processingStatus: "failed", uploadProgress: 100, extractedText: "Client-side error" }
            : f,
        ),
      )
      toast({
        title: "Upload Failed",
        description: `An unexpected error occurred during upload of ${file.name}.`,
        variant: "destructive",
      })
      onFilesUpdated(files.map((f) => (f.id === tempId ? { ...f, uploadProgress: 100 } : f)))
    }
  }

  const pollProcessingStatus = useCallback(
    async (materialId: string) => {
      /* NEW: skip temp ids (they’re < 24 chars) */
      if (materialId.length !== 24) return;
      let attempts = 0
      const maxAttempts = 60 // Poll for up to 5 minutes (5 seconds * 60 attempts)
      const pollInterval = 5000 // 5 seconds

      const poll = async () => {
        if (attempts >= maxAttempts) {
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: "failed",
                    extractedText: "Processing timed out.",
                  }
                : f,
            ),
          )
          onFilesUpdated(
            files.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: "failed",
                    extractedText: "Processing timed out.",
                  }
                : f,
            ),
          )
          toast({
            title: "Processing Timed Out",
            description: "The document took too long to process. Please try again.",
            variant: "destructive",
          })
          return
        }

        try {
          const response = await fetch(`/api/study-materials/status?materialId=${materialId}`)
          if (!response.ok) {
            throw new Error("Failed to fetch processing status")
          }
          const data = await response.json()

          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: data.status,
                    extractedText: data.extractedTextPreview,
                  }
                : f,
            ),
          )
          onFilesUpdated(
            files.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: data.status,
                    extractedText: data.extractedTextPreview,
                  }
                : f,
            ),
          )

          if (data.status === "completed") {
            toast({
              title: "Processing Complete",
              description: `"${data.title}" is ready for use!`,
              variant: "default",
            })
          } else if (data.status === "failed") {
            toast({
              title: "Processing Failed",
              description: `"${data.title}" could not be processed.`,
              variant: "destructive",
            })
          } else {
            attempts++
            setTimeout(poll, pollInterval)
          }
        } catch (error) {
          console.error(`Error polling status for ${materialId}:`, error)
          setFiles((prevFiles) =>
            prevFiles.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: "failed",
                    extractedText: "Error fetching status.",
                  }
                : f,
            ),
          )
          onFilesUpdated(
            files.map((f) =>
              f.id === materialId
                ? {
                    ...f,
                    processingStatus: "failed",
                    extractedText: "Error fetching status.",
                  }
                : f,
            ),
          )
          toast({
            title: "Processing Error",
            description: "Could not get document processing status.",
            variant: "destructive",
          })
        }
      }
      poll()
    },
    [toast, onFilesUpdated, files],
  )

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRetryProcessing = async (fileId: string, fileName: string, fileType: string) => {
    const fileToRetry = files.find((f) => f.id === fileId)
    if (!fileToRetry) return

    setFiles((prevFiles) =>
      prevFiles.map((f) => (f.id === fileId ? { ...f, processingStatus: "processing", extractedText: "" } : f)),
    )
    toast({
      title: "Retrying Processing",
      description: `Attempting to re-process ${fileName}...`,
    })

    // In a real scenario, you'd re-upload the file or trigger a re-processing API endpoint
    // For this example, we'll simulate by re-polling after a short delay
    setTimeout(() => pollProcessingStatus(fileId), 2000)
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    if (fileType.includes("image")) return <ImageIcon className="h-5 w-5 text-blue-500" />
    if (fileType.includes("text")) return <FileText className="h-5 w-5 text-gray-500" />
    return <FileText className="h-5 w-5 text-gray-400" />
  }

  const getStatusBadge = (status: UploadedFile["processingStatus"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      case "completed":
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Completed</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload New Material</CardTitle>
        <CardDescription>Upload PDF, text, or image files to generate practice exams.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject (Optional)</Label>
          <Input
            id="subject"
            placeholder="e.g., Biology, History, Math"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div
          {...getRootProps()}
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors hover:border-primary"
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag &apos;n&apos; drop some files here, or click to select files</p>
          )}
          <span className="text-sm text-muted-foreground">PDF, TXT, JPG, PNG (Max 10MB)</span>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h3 className="mb-2 text-lg font-semibold">Uploaded Files:</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="grid gap-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-4 rounded-md border p-3">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1">
                      <p className="font-medium">{file.fileName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {getStatusBadge(file.processingStatus)}
                        {file.processingStatus === "processing" && (
                          <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        )}
                        {file.processingStatus === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                        {file.processingStatus === "failed" && <XCircle className="h-4 w-4 text-red-500" />}
                      </div>
                      {file.uploadProgress < 100 && file.processingStatus === "pending" && (
                        <Progress value={file.uploadProgress} className="mt-2 h-2" />
                      )}
                      {file.extractedText && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">Preview: {file.extractedText}</p>
                      )}
                    </div>
                    {file.processingStatus === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRetryProcessing(file.id, file.fileName, file.fileType)}
                        title="Retry Processing"
                      >
                        <RefreshCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Files will be processed by AI to extract key information for exam generation.
        </p>
      </CardFooter>
    </Card>
  )
}
