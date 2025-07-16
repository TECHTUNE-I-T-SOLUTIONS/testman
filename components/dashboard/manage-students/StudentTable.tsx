"use client"

import { useState } from "react"
import { CheckCircle, Trash2, AlertCircle, MoreHorizontal, UserCheck, Power } from "lucide-react"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

const ITEMS_PER_PAGE = 10

export default function StudentTable({ students, onActivate, onDelete }: StudentTableProps) {
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)
  const [studentToActivate, setStudentToActivate] = useState<Student | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

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

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedStudents = students.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE)

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">S/N</TableHead>
              <TableHead>Student</TableHead>
              <TableHead className="hidden md:table-cell">Reg. Number</TableHead>
              <TableHead className="hidden md:table-cell">Faculty</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead className="hidden md:table-cell">Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStudents.map((student, index) => {
              const isActive = student.isActive
              return (
                <TableRow key={student._id}>
                  <TableCell className="font-medium">{startIndex + index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(student.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{student.name}</span>
                        <span className="text-xs text-muted-foreground">{student.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{student.matricNumber}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.faculty?.name || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.department?.name || "N/A"}</TableCell>
                  <TableCell className="hidden md:table-cell">{student.level?.name || "N/A"}</TableCell>
                  <TableCell>
                    {isActive ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
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
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>

      {/* Delete Dialog */}
      <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {studentToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activate/Deactivate Dialog */}
      <Dialog open={!!studentToActivate} onOpenChange={(open) => !open && setStudentToActivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {studentToActivate?.isActive ? (
                <Power className="h-5 w-5 text-destructive" />
              ) : (
                <CheckCircle className="h-5 w-5 text-primary" />
              )}
              {studentToActivate?.isActive ? "Confirm Deactivation" : "Confirm Activation"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {studentToActivate?.isActive ? "deactivate" : "activate"}{" "}
              {studentToActivate?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStudentToActivate(null)}>
              Cancel
            </Button>
            <Button onClick={handleActivateConfirm}>
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
    </>
  )
}
