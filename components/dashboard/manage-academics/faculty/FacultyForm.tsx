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

// Define the schema for form validation
const facultySchema = z.object({
  name: z.string().min(2, { message: "Faculty name must be at least 2 characters" }),
  session: z.string().min(1, { message: "Please select a session" }),
})

type FacultyFormValues = z.infer<typeof facultySchema>

interface FacultyFormProps {
  onSave: (faculty: { name: string; session: string }) => Promise<void>
  onCancel?: () => void
  editingFaculty: { id: string; name: string; session: string } | null
  saving?: boolean
}

export default function FacultyForm({ onSave, onCancel, editingFaculty, saving = false }: FacultyFormProps) {
  const [sessions, setSessions] = useState<{ _id: string; name: string }[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  // Initialize the form with react-hook-form
  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: editingFaculty?.name || "",
      session: editingFaculty?.session || "",
    },
  })

  // Update form values when editingFaculty changes
  useEffect(() => {
    if (editingFaculty) {
      form.reset({
        name: editingFaculty.name,
        session: editingFaculty.session,
      })
    } else {
      form.reset({
        name: "",
        session: "",
      })
    }
  }, [editingFaculty, form])

  // Fetch sessions for the dropdown
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true)
      try {
        const response = await fetch("/api/session")
        if (!response.ok) {
          throw new Error("Failed to fetch sessions")
        }
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Error fetching sessions:", error)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [])

  const onSubmit = async (data: FacultyFormValues) => {
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
              <FormLabel>Faculty Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Faculty of Science" {...field} disabled={saving} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="session"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Academic Session</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={saving || loadingSessions}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingSessions ? "Loading sessions..." : "Select a session"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session._id} value={session._id}>
                      {session.name}
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
                {editingFaculty ? "Updating..." : "Creating..."}
              </>
            ) : editingFaculty ? (
              "Update Faculty"
            ) : (
              "Create Faculty"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

