"use client"

import { BookOpen, Pencil, Trash2, Loader2, GraduationCap, Building } from "lucide-react"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { Course, Level } from "@/types/types"


type Department = {
  _id: string
  name: string
  levels: Level[]
}

interface CourseListProps {
  departments: Department[]
  onEdit: (course: Course) => void
  onDelete: (id: string) => void
  confirmDeleteId: string | null
  onConfirmDelete: (id: string) => Promise<void>
  onCancelDelete: () => void
  deletingId: string | null
}

export default function CourseList({
  departments,
  onEdit,
  onDelete,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
  deletingId,
}: CourseListProps) {
  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No courses found</h3>
        <p className="text-muted-foreground mt-1 mb-4">Get started by creating your first course</p>
      </div>
    )
  }

  // Count total courses across all departments and levels
  const totalCourses = departments.reduce((total, dept) => {
    return (
      total +
      dept.levels.reduce((levelTotal, level) => {
        return levelTotal + (level.courses?.length || 0)
      }, 0)
    )
  }, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {totalCourses} {totalCourses === 1 ? "course" : "courses"} across {departments.length}{" "}
          {departments.length === 1 ? "department" : "departments"}
        </p>
      </div>

      <Accordion type="multiple" className="space-y-4">
        {departments.map((department) => (
          <AccordionItem key={department._id} value={department._id} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-primary" />
                <span className="font-medium">{department.name}</span>
                <Badge variant="outline" className="ml-2">
                  {department.levels.reduce((total, level) => total + (level.courses?.length || 0), 0)} courses
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                {department.levels.map((level) => (
                  <div key={level._id} className="space-y-2">
                    <div className="flex items-center gap-2 pl-2 py-2 border-l-2 border-primary/20">
                      <GraduationCap className="h-4 w-4 text-primary/70" />
                      <h4 className="font-medium text-sm">{level.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {level.courses?.length || 0} {level.courses?.length === 1 ? "course" : "courses"}
                      </Badge>
                    </div>

                    {level.courses && level.courses.length > 0 ? (
                      <div className="space-y-2 pl-6">
                        {level.courses.map((course: Course) => (
                          <div
                            key={course._id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                          >
                            <div className="space-y-1 mb-3 sm:mb-0">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-primary mr-2" />
                                <h3 className="font-medium">{course.name}</h3>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {course.code}
                              </Badge>
                            </div>
                            <div className="flex space-x-2 self-end sm:self-auto">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onEdit({
                                    _id: course._id,
                                    name: course.name,
                                    code: course.code,
                                    departmentId: department._id,
                                    levelId: level._id,
                                    facultyId: "", // This will be set in the form
                                  })
                                }
                                className="h-9"
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(course._id!)}
                                disabled={deletingId === course._id}
                                className="h-9"
                              >
                                {deletingId === course._id ? (
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
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground pl-4">No courses available for this level</p>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && onCancelDelete()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course. This action cannot be undone.
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

