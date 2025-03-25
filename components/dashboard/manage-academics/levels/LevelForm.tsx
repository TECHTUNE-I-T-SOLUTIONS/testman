"use client"

import { useState, useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Faculty } from "@/types/types"

// Define the schema for form validation
const levelSchema = z.object({
  name: z.string().min(2, { message: "Level name must be at least 2 characters" }),
  facultyId: z.string().min(1, { message: "Please select a faculty" }),
  departmentId: z.string().min(1, { message: "Please select a department" }),
})

type LevelFormValues = z.infer<typeof levelSchema>

interface Level {
  _id: string
  name: string
  departmentId: string | { _id: string }
  courses: string[]
}

interface Department {
  _id: string
  name: string
  facultyId: string
}

interface LevelFormProps {
  onSave: (data: { name: string; departmentId: string }, id?: string) => Promise<void>
  onCancel?: () => void
  faculties: Faculty[]
  departments: Department[]
  fetchDepartments: (facultyId: string) => Promise<void>
  editingLevel: Level | null
  saving?: boolean
}

export default function LevelForm({
  onSave,
  onCancel,
  faculties,
  departments,
  fetchDepartments,
  editingLevel,
  saving = false,
}: LevelFormProps) {
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<string>("")

  // Initialize the form with react-hook-form
  const form = useForm<LevelFormValues>({
    resolver: zodResolver(levelSchema),
    defaultValues: {
      name: "",
      facultyId: "",
      departmentId: "",
    },
  })

  // Update form values when editingLevel changes
  useEffect(() => {
    if (editingLevel) {
      const departmentId =
        typeof editingLevel.departmentId === "object" ? editingLevel.departmentId._id : editingLevel.departmentId

      // Find the department to get its facultyId
      const department = departments.find((d) => d._id === departmentId)

      if (department) {
        form.setValue("facultyId", department.facultyId)
        setSelectedFaculty(department.facultyId)

        // Filter departments for this faculty
        const depts = departments.filter((d) => d.facultyId === department.facultyId)
        setFilteredDepartments(depts)

        form.setValue("departmentId", departmentId)
        form.setValue("name", editingLevel.name)
      }
    } else {
      form.reset({
        name: "",
        facultyId: "",
        departmentId: "",
      })
      setSelectedFaculty("")
      setFilteredDepartments([])
    }
  }, [editingLevel, departments, form])

  // Handle faculty change
  const handleFacultyChange = async (facultyId: string) => {
    setSelectedFaculty(facultyId)
    form.setValue("facultyId", facultyId)
    form.setValue("departmentId", "") // Reset department when faculty changes

    if (facultyId) {
      await fetchDepartments(facultyId)
      const depts = departments.filter((d) => d.facultyId === facultyId)
      setFilteredDepartments(depts)
    } else {
      setFilteredDepartments([])
    }
  }

  const onSubmit = async (data: LevelFormValues) => {
    await onSave(
      {
        name: data.name,
        departmentId: data.departmentId,
      },
      editingLevel?._id,
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 100 Level, 200 Level, etc." {...field} disabled={saving} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="facultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select
                onValueChange={(value) => handleFacultyChange(value)}
                value={field.value}
                disabled={saving || faculties.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={faculties.length === 0 ? "No faculties available" : "Select a faculty"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={saving || !selectedFaculty || filteredDepartments.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedFaculty
                          ? "Select a faculty first"
                          : filteredDepartments.length === 0
                            ? "No departments available"
                            : "Select a department"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredDepartments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {editingLevel ? "Updating..." : "Creating..."}
              </>
            ) : editingLevel ? (
              "Update Level"
            ) : (
              "Create Level"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

