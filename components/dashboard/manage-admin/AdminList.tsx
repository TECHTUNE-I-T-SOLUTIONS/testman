"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Users, Shield, Settings, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import AdminActions from "./AdminActions"

interface Admin {
  _id: string
  matricNumber: string
  email: string
  role: "Admin" | "Sub-Admin"
  assignedFaculty?: string
  assignedDepartment?: string
}

interface Faculty {
  _id: string
  name: string
}

interface Department {
  _id: string
  name: string
}

interface AdminListProps {
  admins: Admin[]
  fetchAdmins: () => void
}

export default function AdminList({ admins, fetchAdmins }: AdminListProps) {
  const { data: session, status } = useSession()
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  const currentRole = session?.user?.role

  useEffect(() => {
    async function fetchData() {
      try {
        const [facultyRes, departmentRes] = await Promise.all([fetch("/api/faculties"), fetch("/api/departments")])
        if (!facultyRes.ok || !departmentRes.ok) throw new Error("Failed to fetch data")
        const facultyData = await facultyRes.json()
        const departmentData = await departmentRes.json()
        setFaculties(facultyData)
        setDepartments(departmentData)
      } catch (error) {
        console.error("Error fetching faculty/department data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Helper functions
  const getFacultyName = (facultyId?: string) => faculties.find((faculty) => faculty._id === facultyId)?.name || "N/A"

  const getDepartmentName = (departmentId?: string) =>
    departments.find((department) => department._id === departmentId)?.name || "N/A"

  // Wait for session to load
  if (status === "loading" || loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Filter admins based on logged-in role
  const visibleAdmins = currentRole === "Admin" ? admins.filter((admin) => admin.role === "Sub-Admin") : admins // Super-admin sees all

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Administrator List
        </CardTitle>
        <CardDescription>
          {visibleAdmins.length} {visibleAdmins.length === 1 ? "administrator" : "administrators"} found
        </CardDescription>
      </CardHeader>
      <CardContent>
        {visibleAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Administrators Found</h3>
            <p className="text-muted-foreground max-w-md mt-2">
              No administrators are currently registered in the system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleAdmins.map((admin) => (
              <div key={admin._id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {admin.role === "Admin" ? (
                          <Shield className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Settings className="h-4 w-4 text-purple-600" />
                        )}
                        <span className="font-medium">{admin.matricNumber}</span>
                      </div>
                      <Badge
                        variant={admin.role === "Admin" ? "default" : "secondary"}
                        className={
                          admin.role === "Admin"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                            : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                        }
                      >
                        {admin.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{admin.email}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <Badge variant="outline" className="text-xs">
                        {admin.role === "Admin"
                          ? getFacultyName(admin.assignedFaculty)
                          : getDepartmentName(admin.assignedDepartment)}
                      </Badge>
                    </div>
                  </div>
                  <AdminActions admin={admin} fetchAdmins={fetchAdmins} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
