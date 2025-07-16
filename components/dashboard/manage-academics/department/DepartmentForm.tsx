"use client"

import { useEffect } from "react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { Faculty } from "@/types/types"

const departmentSchema = z.object({
  name: z.string().min(2, { message: "Department name must be at least 2 characters" }),
  facultyId: z.string().min(1, { message: "Please select a faculty" }),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

type Department = {
  _id: string
  name: string
  facultyId: string
}

interface DepartmentFormProps {
  onSave: (department: { name: string; facultyId: string }) => Promise<void>
  onCancel?: () => void
  editingDepartment: Department | null
  faculties: Faculty[]
  saving?: boolean
}

export default function DepartmentForm({
  onSave,
  onCancel,
  editingDepartment,
  faculties,
  saving = false,
}: DepartmentFormProps) {
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: editingDepartment?.name || "",
      facultyId: editingDepartment?.facultyId || "",
    },
  })

  useEffect(() => {
    if (editingDepartment) {
      form.reset({
        name: editingDepartment.name,
        facultyId: editingDepartment.facultyId,
      })
    } else {
      form.reset({
        name: "",
        facultyId: "",
      })
    }
  }, [editingDepartment, form])

  const onSubmit = async (data: DepartmentFormValues) => {
    await onSave(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Computer Science" {...field} disabled={saving} />
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
                onValueChange={field.onChange}
                defaultValue={field.value}
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
                {editingDepartment ? "Updating..." : "Creating..."}
              </>
            ) : editingDepartment ? (
              "Update Department"
            ) : (
              "Create Department"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
