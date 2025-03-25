"use client"

import { Layers, Pencil, Trash2, Loader2 } from "lucide-react"
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

interface Level {
  _id: string
  name: string
  departmentId: string | { _id: string; name?: string }
  departmentName?: string
  courses: string[]
}

interface Department {
  _id: string
  name: string
  facultyId: string
}

interface LevelListProps {
  levels: Level[]
  departments: Department[]
  onEdit: (level: Level) => void
  onDelete: (id: string) => void
  confirmDeleteId: string | null
  onConfirmDelete: (id: string) => Promise<void>
  onCancelDelete: () => void
  deletingId: string | null
  getDepartmentName: (departmentId: string) => string
}

export default function LevelList({
  levels,
  onEdit,
  onDelete,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
  deletingId,
  getDepartmentName,
}: LevelListProps) {
  if (levels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layers className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No levels found</h3>
        <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first academic level</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {levels.map((level) => {
        const departmentId = typeof level.departmentId === "object" ? level.departmentId._id : level.departmentId

        const departmentName = level.departmentName || getDepartmentName(departmentId)

        return (
          <div
            key={level._id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="space-y-1 mb-3 sm:mb-0">
              <div className="flex items-center">
                <Layers className="h-4 w-4 text-primary mr-2" />
                <h3 className="font-medium">{level.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Department: {departmentName}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {level.courses?.length || 0} Courses
                </Badge>
              </div>
            </div>
            <div className="flex space-x-2 self-end sm:self-auto">
              <Button variant="outline" size="sm" onClick={() => onEdit(level)} className="h-9">
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(level._id)}
                disabled={deletingId === level._id}
                className="h-9"
              >
                {deletingId === level._id ? (
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
        )
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && onCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the academic level. This action cannot be undone.
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

