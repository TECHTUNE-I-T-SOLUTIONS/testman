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
  files: UploadedFile[]
  setFiles: (files: UploadedFile[]) => void
  onFilesUpdated: (files: UploadedFile[]) => void
}

export function FileUpload({ files, setFiles, onFilesUpdated }: FileUploadProps) {
  const { toast } = useToast()
  const [subject, setSubject] = useState("")

  // pollProcessingStatus: add explicit types and cast processingStatus
  const pollProcessingStatus = useCallback(
    async (materialId: string) => {
      if (materialId.length !== 24) {
        console.log(`⏭️ Skipping polling for temp ID: ${materialId}`)
        return
      }
      console.log(`🔄 Starting to poll processing status for: ${materialId}`)
      let attempts = 0
      const maxAttempts = 60
      const pollInterval = 5000
      const poll = async () => {
        if (attempts >= maxAttempts) {
          console.error(`⏰ Processing timed out for material: ${materialId}`)
          const updatedFiles = files.map((f: UploadedFile) =>
            f.id === materialId
              ? {
                  ...f,
                  processingStatus: "failed" as UploadedFile['processingStatus'],
                  extractedText: "Processing timed out."
                }
              : f
          )
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
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
          const updatedFiles = files.map((f: UploadedFile) =>
            f.id === materialId
              ? {
                  ...f,
                  processingStatus: data.status as UploadedFile['processingStatus'],
                  extractedText: data.extractedTextPreview
                }
              : f
          )
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
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
          const updatedFiles = files.map((f: UploadedFile) =>
            f.id === materialId
              ? {
                  ...f,
                  processingStatus: "failed" as UploadedFile['processingStatus'],
                  extractedText: "Error fetching status."
                }
              : f
          )
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
          toast({
            title: "Processing Error",
            description: "Could not get document processing status.",
            variant: "destructive",
          })
        }
      }
      poll()
    },
    [toast, onFilesUpdated, files, setFiles]
  )

  // 1. uploadFile as useCallback, above onDrop
  const uploadFile = useCallback(async (file: File, tempId: string) => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("subject", subject)

    try {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", "/api/study-materials/upload", true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentCompleted = Math.round((event.loaded * 100) / event.total)
          const updatedFiles = files.map((f: UploadedFile) => (f.id === tempId ? { ...f, uploadProgress: percentCompleted } : f))
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
        }
      }

      xhr.onload = async () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          const materialId = response.material.id
          const updatedFiles = files.map((f: UploadedFile) =>
            f.id === tempId
              ? {
                  ...f,
                  id: materialId,
                  processingStatus: "pending" as UploadedFile['processingStatus'],
                  uploadProgress: 100,
                }
              : f
          )
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded. Processing started...`,
            variant: "default",
          })
          pollProcessingStatus(materialId)
        } else {
          const errorData = JSON.parse(xhr.responseText)
          const updatedFiles = files.map((f: UploadedFile) =>
            f.id === tempId
              ? { ...f, processingStatus: "failed" as UploadedFile['processingStatus'], uploadProgress: 100, extractedText: errorData.error }
              : f
          )
          setFiles(updatedFiles)
          onFilesUpdated(updatedFiles)
          toast({
            title: "Upload Failed",
            description: errorData.error || `Failed to upload ${file.name}.`,
            variant: "destructive",
          })
        }
      }

      xhr.onerror = () => {
        const updatedFiles = files.map((f: UploadedFile) =>
          f.id === tempId
            ? { ...f, processingStatus: "failed" as UploadedFile['processingStatus'], uploadProgress: 100, extractedText: "Network error" }
            : f
        )
        setFiles(updatedFiles)
        onFilesUpdated(updatedFiles)
        toast({
          title: "Upload Failed",
          description: `Network error during upload of ${file.name}.`,
          variant: "destructive",
        })
      }

      xhr.send(formData)
    } catch (error) {
      console.error("Error during file upload:", error)
      const updatedFiles = files.map((f: UploadedFile) =>
        f.id === tempId
          ? { ...f, processingStatus: "failed" as UploadedFile['processingStatus'], uploadProgress: 100, extractedText: "Client-side error" }
          : f
      )
      setFiles(updatedFiles)
      onFilesUpdated(updatedFiles)
      toast({
        title: "Upload Failed",
        description: `An unexpected error occurred during upload of ${file.name}.`,
        variant: "destructive",
      })
    }
  }, [files, setFiles, onFilesUpdated, subject, toast, pollProcessingStatus])

  // 2. onDrop uses uploadFile in deps
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
      const newFilesToAdd: UploadedFile[] = acceptedFiles.map((file: File) => ({
        id: Math.random().toString(36).substring(2, 15),
        title: file.name.split(".")[0],
        fileName: file.name,
        fileType: file.type,
        processingStatus: "pending" as UploadedFile['processingStatus'],
        uploadProgress: 0,
      }))
      const updatedFiles = [...files, ...newFilesToAdd]
      setFiles(updatedFiles)
      onFilesUpdated(updatedFiles)
      for (const file of acceptedFiles) {
        await uploadFile(file, newFilesToAdd.find((f: UploadedFile) => f.fileName === file.name)?.id || "")
      }
    },
    [toast, onFilesUpdated, files, setFiles, uploadFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  // In handleRetryProcessing, add explicit types
  const handleRetryProcessing = async (fileId: string, fileName: string) => {
    const fileToRetry = files.find((f: UploadedFile) => f.id === fileId)
    if (!fileToRetry) return
    const updatedFiles = files.map((f: UploadedFile) => (f.id === fileId ? { ...f, processingStatus: "processing" as UploadedFile['processingStatus'], extractedText: "" } : f))
    setFiles(updatedFiles)
    onFilesUpdated(updatedFiles)
    toast({
      title: "Retrying Processing",
      description: `Attempting to re-process ${fileName}...`,
    })
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
          className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 sm:p-6 lg:p-8 text-center transition-colors hover:border-primary cursor-pointer min-h-[120px] w-full"
        >
          <input {...getInputProps()} />
          <UploadCloud className="mb-2 h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm sm:text-base">Drop the files here ...</p>
          ) : (
            <p className="text-sm sm:text-base px-2">Drag &apos;n&apos; drop some files here, or click to select files</p>
          )}
          <span className="text-xs sm:text-sm text-muted-foreground mt-1">PDF, TXT, JPG, PNG (Max 10MB)</span>
        </div>

        {files.length > 0 && (
          <div className="mt-4 w-full">
            <h3 className="mb-2 text-base sm:text-lg font-semibold">Uploaded Files:</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border p-2 sm:p-4">
              <div className="grid gap-2 sm:gap-4">
                {files.map((file) => (
                  <div key={file.id} className="flex items-start sm:items-center gap-2 sm:gap-4 rounded-md border p-2 sm:p-3">
                    <div className="shrink-0">
                      {getFileIcon(file.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{file.fileName}</p>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        {getStatusBadge(file.processingStatus)}
                        {file.processingStatus === "processing" && (
                          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-primary" />
                        )}
                        {file.processingStatus === "completed" && <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />}
                        {file.processingStatus === "failed" && <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />}
                      </div>
                      {file.uploadProgress < 100 && file.processingStatus === "pending" && (
                        <Progress value={file.uploadProgress} className="mt-2 h-1 sm:h-2" />
                      )}
                      {file.extractedText && (
                        <p className="mt-1 text-xs text-muted-foreground line-clamp-2">Preview: {file.extractedText}</p>
                      )}
                    </div>
                    {file.processingStatus === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRetryProcessing(file.id, file.fileName)}
                        title="Retry Processing"
                        className="shrink-0"
                      >
                        <RefreshCcw className="h-3 w-3 sm:h-4 sm:w-4" />
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