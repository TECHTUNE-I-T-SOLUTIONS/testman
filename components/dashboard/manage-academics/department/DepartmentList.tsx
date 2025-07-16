"use client"

import { Building, Pencil, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import type { Faculty } from "@/types/types"

type Department = {
  _id: string
  name: string
  facultyId: string
  facultyName?: string
}

interface DepartmentListProps {
  departments: Department[]
  onEdit: (department: Department) => void
  onDelete: (id: string) => void
  confirmDeleteId: string | null
  onConfirmDelete: (id: string) => Promise<void>
  onCancelDelete: () => void
  deletingId: string | null
  faculties: Faculty[]
}

export default function DepartmentList({
  departments,
  onEdit,
  onDelete,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
  deletingId,
  faculties,
}: DepartmentListProps) {
  const getFacultyName = (facultyId: string): string => {
    const faculty = faculties.find((f) => f._id === facultyId)
    return faculty ? faculty.name : "Unknown Faculty"
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Building className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No departments found</h3>
        <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first department</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => (
        <div
          key={department._id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="space-y-1 mb-3 sm:mb-0">
            <div className="flex items-center">
              <Building className="h-4 w-4 text-primary mr-2" />
              <h3 className="font-medium">{department.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Faculty: {department.facultyName || getFacultyName(department.facultyId)}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2 self-end sm:self-auto">
            <Button variant="outline" size="sm" onClick={() => onEdit(department)} className="h-9">
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(department._id)}
              disabled={deletingId === department._id}
              className="h-9"
            >
              {deletingId === department._id ? (
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
          </div>
        </div>
      ))}

      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && onCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the department. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && onConfirmDelete(confirmDeleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
