"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Building, PlusCircle, FolderTree, AlertCircle } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import DepartmentForm from "@/components/dashboard/manage-academics/department/DepartmentForm"
import DepartmentList from "@/components/dashboard/manage-academics/department/DepartmentList"
import type { Faculty } from "@/types/types"

type Department = {
  _id: string
  name: string
  facultyId: string
  facultyName?: string
}

type DepartmentInput = {
  name: string
  facultyId: string
}

type DepartmentAPIResponse = {
  _id: string
  name: string
  facultyId: { _id: string; name: string } | string
}

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("list")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchFaculties()
    fetchDepartments()
  }, [])

  // Switch to form tab when editing
  useEffect(() => {
    if (editingDepartment) {
      setActiveTab("form")
    }
  }, [editingDepartment])

  const fetchFaculties = async () => {
    try {
      const response = await fetch("/api/faculties")
      if (!response.ok) throw new Error("Failed to fetch faculties")
      const data = await response.json()
      setFaculties(data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch faculties.")
      setError("Failed to load faculties. Please try again.")
    }
  }

  const fetchDepartments = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/departments")
      if (!response.ok) throw new Error("Failed to fetch departments")

      const data: DepartmentAPIResponse[] = await response.json()

      const transformedDepartments = data.map((dept) => {
        const facultyData = typeof dept.facultyId === "object" ? dept.facultyId : null
        return {
          _id: dept._id,
          name: dept.name,
          facultyId: facultyData ? facultyData._id : (dept.facultyId as string),
          facultyName: facultyData ? facultyData.name : undefined,
        }
      })

      setDepartments(transformedDepartments)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch departments.")
      setError("Failed to load departments. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (departmentInput: DepartmentInput) => {
    setSaving(true)
    try {
      let response

      if (editingDepartment?._id) {
        response = await fetch(`/api/departments?id=${editingDepartment._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(departmentInput),
        })

        if (!response.ok) throw new Error("Failed to update department.")
        toast.success("Department updated successfully.")
      } else {
        response = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(departmentInput),
        })

        if (!response.ok) throw new Error("Failed to create department.")
        toast.success("Department created successfully.")
      }

      setEditingDepartment(null)
      fetchDepartments()
      setActiveTab("list")
    } catch (error) {
      console.error("Failed to save department:", error)
      toast.error((error as Error).message || "An unexpected error occurred.")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id)
  }

  const confirmDelete = async (id: string) => {
    setDeleting(id)
    try {
      const url = `/api/departments?id=${encodeURIComponent(id)}`
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to delete department.")
      }

      toast.success("Department deleted successfully.")
      setConfirmDeleteId(null)
      fetchDepartments()
    } catch (error) {
      console.error("Failed to delete department:", error)
      toast.error((error as Error).message || "An unexpected error occurred.")
    } finally {
      setDeleting(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingDepartment(null)
    setActiveTab("list")
  }

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FolderTree className="h-8 w-8 text-primary" />
            Manage Departments
          </h1>
          <p className="text-muted-foreground mt-1">Create and manage academic departments for your institution</p>
        </div>
        <Button
          onClick={() => {
            setEditingDepartment(null)
            setActiveTab("form")
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Department
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Department List</TabsTrigger>
          <TabsTrigger value="form">{editingDepartment ? "Edit Department" : "Add Department"}</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Department List
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Loading departments..."
                  : `${departments.length} ${departments.length === 1 ? "department" : "departments"} found`}
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
                <DepartmentList
                  departments={departments}
                  onEdit={setEditingDepartment}
                  onDelete={handleDeleteRequest}
                  confirmDeleteId={confirmDeleteId}
                  onConfirmDelete={confirmDelete}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  deletingId={deleting}
                  faculties={faculties}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>{editingDepartment ? "Edit Department" : "Add New Department"}</CardTitle>
              <CardDescription>
                {editingDepartment
                  ? "Update the department information"
                  : "Fill in the details to create a new department"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DepartmentForm
                onSave={handleSave}
                onCancel={handleCancelEdit}
                editingDepartment={editingDepartment}
                faculties={faculties}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

