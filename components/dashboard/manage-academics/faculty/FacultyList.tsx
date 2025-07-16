"use client"

import { Building, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Faculty } from "@/types/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"

interface FacultyListProps {
  faculties: Faculty[]
  onEdit: (faculty: Faculty) => void
  onDelete: (id: string) => Promise<void>
  deletingId: string | null
}

export default function FacultyList({ faculties, onEdit, onDelete, deletingId }: FacultyListProps) {
  const [facultyToDelete, setFacultyToDelete] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setFacultyToDelete(id)
  }

  const confirmDelete = async () => {
    if (facultyToDelete) {
      await onDelete(facultyToDelete)
      setFacultyToDelete(null)
    }
  }

  if (faculties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No faculties found</h3>
        <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first faculty</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {faculties.map((faculty) => (
        <div
          key={faculty._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1 mb-3 sm:mb-0">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-primary mr-2" />
              <h3 className="font-medium">{faculty.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Session: {faculty.session || "Unknown"}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => onEdit(faculty)} className="h-9">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <AlertDialog
              open={facultyToDelete === faculty._id}
              onOpenChange={(open) => !open && setFacultyToDelete(null)}
            >
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteClick(faculty._id)}
                  disabled={deletingId === faculty._id}
                  className="h-9"
                >
                  {deletingId === faculty._id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the faculty &quot;{faculty.name}&quot;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={confirmDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
    </div>
  )
}
