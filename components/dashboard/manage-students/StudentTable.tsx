"use client"

import { useState } from "react"
import { CheckCircle, Trash2, AlertCircle, MoreHorizontal, UserCheck, Power, Mail, GraduationCap, Building, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

type Student = {
  _id: string
  name: string
  email: string
  matricNumber: string
  faculty: { _id: string; name: string }
  department: { _id: string; name: string }
  level: { _id: string; name: string }
  isActive: boolean
}

type StudentTableProps = {
  students: Student[]
  onActivate: (id: string, newStatus: boolean) => void
  onDelete: (id: string) => void
}

const ITEMS_PER_PAGE = 12

export default function StudentTable({ students, onActivate, onDelete }: StudentTableProps) {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [studentToActivate, setStudentToActivate] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      onDelete(studentToDelete._id)
      setStudentToDelete(null)
    }
  }

  const handleActivateConfirm = () => {
    if (studentToActivate) {
      const newStatus = !studentToActivate.isActive
      onActivate(studentToActivate._id, newStatus)
      setStudentToActivate(null)
    }
  }

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()

  // Filter students based on search query
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.faculty?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.department?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedStudents = filteredStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search students by name, email, matric number, faculty, or department..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-background border-border"
        />
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredStudents.length} of {students.length} students
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="text-muted-foreground hover:text-foreground"
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {paginatedStudents.map((student) => {
          const isActive = student.isActive
          return (
            <Card 
              key={student._id} 
              className={`transition-all duration-200 hover:shadow-lg border-border bg-card hover:bg-card/80 ${
                !isActive ? 'opacity-75' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-border">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(student.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-semibold text-foreground truncate">
                        {student.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.matricNumber}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setStudentToActivate(student)}>
                        {isActive ? (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            <span>Activate</span>
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStudentToDelete(student)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">{student.email}</span>
                </div>

                {/* Faculty */}
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {student.faculty?.name || "N/A"}
                  </span>
                </div>

                {/* Department */}
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {student.department?.name || "N/A"}
                  </span>
                </div>

                {/* Level */}
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground truncate">
                    {student.level?.name || "N/A"}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="pt-2">
                  {isActive ? (
                    <Badge 
                      variant="outline" 
                      className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge 
                      variant="outline" 
                      className="bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                    >
                      <Power className="mr-1 h-3 w-3" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {paginatedStudents.length === 0 && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-3 mb-4">
              <UserCheck className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchQuery ? "No students found" : "No students available"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchQuery 
                ? "Try adjusting your search criteria or clear the search to see all students."
                : "There are currently no students registered in the system."
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
            className="border-border text-foreground hover:bg-muted"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <span className="text-sm text-muted-foreground">
              ({filteredStudents.length} students)
            </span>
          </div>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
            className="border-border text-foreground hover:bg-muted"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete <strong className="text-foreground">{studentToDelete?.name}</strong>? 
              This action cannot be undone and will permanently remove the student from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStudentToDelete(null)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate/Deactivate Dialog */}
      <Dialog open={!!studentToActivate} onOpenChange={(open) => !open && setStudentToActivate(null)}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              {studentToActivate?.isActive ? (
                <Power className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
              {studentToActivate?.isActive ? "Confirm Deactivation" : "Confirm Activation"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to {studentToActivate?.isActive ? "deactivate" : "activate"}{" "}
              <strong className="text-foreground">{studentToActivate?.name}</strong>?
              {studentToActivate?.isActive 
                ? " The student will no longer be able to access the system."
                : " The student will be able to access the system again."
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setStudentToActivate(null)}
              className="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button 
              variant={studentToActivate?.isActive ? "destructive" : "default"}
              onClick={handleActivateConfirm}
            >
              {studentToActivate?.isActive ? (
                <Power className="mr-2 h-4 w-4" />
              ) : (
                <UserCheck className="mr-2 h-4 w-4" />
              )}
              {studentToActivate?.isActive ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
