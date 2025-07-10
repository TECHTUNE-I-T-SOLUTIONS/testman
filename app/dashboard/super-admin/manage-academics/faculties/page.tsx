"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Building, PlusCircle, School } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import FacultyForm from "@/components/dashboard/manage-academics/faculty/FacultyForm"
import FacultyList from "@/components/dashboard/manage-academics/faculty/FacultyList"
import type { Faculty, FacultyInput } from "@/types/types"

export default function Faculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchFaculties()
  }, [])

  useEffect(() => {
    if (editingFaculty) {
      setActiveTab("form")
    }
  }, [editingFaculty])

  const fetchFaculties = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/faculties")
      if (!response.ok) {
        throw new Error("Failed to fetch faculties")
      }
      const data: Faculty[] = await response.json()
      setFaculties(data)
    } catch (error) {
      console.error(error)
      setError("Failed to load faculties. Please try again.")
      toast.error("Failed to fetch faculties.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (facultyInput: FacultyInput) => {
    setSaving(true)
    try {
      let response
      if (editingFaculty?._id) {
        response = await fetch(`/api/faculties`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingFaculty._id, ...facultyInput }),
        })
        if (!response.ok) {
          throw new Error("Failed to update faculty.")
        }
        toast.success("Faculty updated successfully.")
      } else {
        response = await fetch("/api/faculties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(facultyInput),
        })
        if (!response.ok) {
          throw new Error("Failed to create faculty.")
        }
        toast.success("Faculty created successfully.")
      }
      setEditingFaculty(null)
      fetchFaculties()
      setActiveTab("list")
    } catch (error) {
      console.error("Failed to save faculty:", error)
      toast.error((error as Error).message || "An unexpected error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      if (!id) {
        toast.error("Invalid faculty ID.")
        return
      }
      const response = await fetch(`/api/faculties?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete faculty.")
      }
      toast.success("Faculty deleted successfully.")
      fetchFaculties()
    } catch (error) {
      console.error("Failed to delete faculty:", error)
      toast.error((error as Error).message || "An unexpected error occurred.")
    } finally {
      setDeleting(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingFaculty(null)
    setActiveTab("list")
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <School className="h-8 w-8 text-primary" />
            Manage Faculties
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage faculties for your institution</p>
        </div>
        <Button
          onClick={() => {
            setEditingFaculty(null)
            setActiveTab("form")
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Faculty
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Faculty List</TabsTrigger>
          <TabsTrigger value="form">{editingFaculty ? "Edit Faculty" : "Add Faculty"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Faculty List
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Loading faculties..."
                  : `${faculties.length} ${faculties.length === 1 ? "faculty" : "faculties"} found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <FacultyList
                  faculties={faculties}
                  onEdit={setEditingFaculty}
                  onDelete={handleDelete}
                  deletingId={deleting}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>{editingFaculty ? "Edit Faculty" : "Add New Faculty"}</CardTitle>
              <CardDescription>
                {editingFaculty ? "Update the faculty information" : "Fill in the details to create a new faculty"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FacultyForm
                onSave={handleSave}
                onCancel={handleCancelEdit}
                editingFaculty={
                  editingFaculty
                    ? {
                        id: editingFaculty._id,
                        name: editingFaculty.name,
                        session: editingFaculty.session,
                      }
                    : null
                }
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
