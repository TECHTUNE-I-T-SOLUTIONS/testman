"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Search, Users, AlertCircle, RefreshCw, Filter, UserCheck, UserX } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import StudentTable from "@/components/dashboard/manage-students/StudentTable"

// Updated Student Type
export type Student = {
  _id: string
  name: string
  email: string
  matricNumber: string
  faculty: { _id: string; name: string }
  department: { _id: string; name: string }
  level: { _id: string; name: string }
  isActive: boolean // Changed from string to boolean
}

export default function ManageStudents() {
  const { data: session } = useSession() // ✅ GET SESSION

  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [facultyFilter, setFacultyFilter] = useState<string>("")
  const [departmentFilter, setDepartmentFilter] = useState<string>("")
  const [levelFilter, setLevelFilter] = useState<string>("")
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    if (!session?.user?.email) return
    const fetchStudents = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/students?email=${session.user.email}`)
        if (!res.ok) throw new Error("Failed to fetch students")
        const rawData: Student[] = await res.json()
        const data = rawData.map((student) => ({
          ...student,
          isActive: student.isActive === true,
        }))
        setStudents(data)
        setFilteredStudents(data)
      } catch (error) {
        console.error("Failed to fetch students:", error)
        setError("Failed to load students. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [session?.user?.email])

  useEffect(() => {
    let filtered = students
    // Apply tab filter (active/inactive/all)
    if (activeTab === "active") {
      filtered = filtered.filter((student) => student.isActive === true)
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((student) => student.isActive === false)
    }
    // Apply faculty filter
    if (facultyFilter) {
      filtered = filtered.filter((student) => student.faculty?.name === facultyFilter)
    }
    // Apply department filter
    if (departmentFilter) {
      filtered = filtered.filter((student) => student.department?.name === departmentFilter)
    }
    // Apply level filter
    if (levelFilter) {
      filtered = filtered.filter((student) => student.level?.name === levelFilter)
    }
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }
    setFilteredStudents(filtered)
  }, [facultyFilter, departmentFilter, levelFilter, students, searchTerm, activeTab])

  // Toggle isActive Status
  const handleActivate = async (id: string, newStatus: boolean) => {
    try {
      await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      })
      setStudents((prev) => prev.map((student) => (student._id === id ? { ...student, isActive: newStatus } : student)))
      toast.success(`Student ${newStatus ? "activated" : "deactivated"} successfully`)
    } catch (error) {
      console.error("Failed to update student status:", error)
      toast.error("Failed to update student status")
    }
  }

  const handleActivateAll = async () => {
    const allActive = students.every((s) => s.isActive)
    if (allActive) {
      toast.info("All students are already active")
      return
    }
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activateAll: true }),
      })
      if (!res.ok) throw new Error("Failed to activate all students")
      const updatedStudents = await res.json()
      setStudents(updatedStudents)
      toast.success("All students activated successfully")
    } catch (err) {
      console.error("Error activating all students:", err)
      toast.error("Failed to activate all students")
    }
  }

  const handleDeactivateAll = async () => {
    const allInactive = students.every((s) => !s.isActive)
    if (allInactive) {
      toast.info("All students are already inactive")
      return
    }
    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deactivateAll: true }),
      })
      if (!res.ok) throw new Error("Failed to deactivate all students")
      const updatedStudents = await res.json()
      setStudents(updatedStudents)
      toast.success("All students deactivated successfully")
    } catch (err) {
      console.error("Error deactivating all students:", err)
      toast.error("Failed to deactivate all students")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      setStudents((prev) => prev.filter((student) => student._id !== id))
      toast.success("Student deleted successfully")
    } catch (error) {
      console.error("Failed to delete student:", error)
      toast.error("Failed to delete student")
    }
  }

  const resetFilters = () => {
    setFacultyFilter("")
    setDepartmentFilter("")
    setLevelFilter("")
    setSearchTerm("")
    setActiveTab("all")
  }

  // Extract unique values for filters
  const faculties = Array.from(new Set(students.map((student) => student.faculty?.name))).filter(Boolean)
  const departments = Array.from(new Set(students.map((student) => student.department?.name))).filter(Boolean)
  const levels = Array.from(new Set(students.map((student) => student.level?.name))).filter(Boolean)

  // Calculate stats
  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive === true).length,
    inactive: students.filter((s) => s.isActive === false).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8 p-4 sm:p-6 md:p-8">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              Manage Students
            </h1>
            <p className="text-gray-600 mt-2 text-lg">View, filter, and manage student accounts</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={resetFilters} variant="outline" className="flex items-center gap-2 bg-white">
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </Button>
            <Button
              onClick={handleActivateAll}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <UserCheck className="h-4 w-4" />
              Activate All
            </Button>
            <Button
              onClick={handleDeactivateAll}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <UserX className="h-4 w-4" />
              Deactivate All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-white shadow-sm border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <p className="text-xs text-gray-500 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Active Students</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-gray-500 mt-1">Can access platform</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Inactive Students</CardTitle>
              <UserX className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-gray-500 mt-1">Restricted access</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {loading ? (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full max-w-md" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Alert variant="destructive" className="bg-white">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Students</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                Student Management
              </CardTitle>
              <CardDescription>
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
                {searchTerm && ` for "${searchTerm}"`}
                {(facultyFilter || departmentFilter || levelFilter) && " with applied filters"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search by name, email or matric number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>

                  {/* Status Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100">
                      <TabsTrigger value="all" className="data-[state=active]:bg-white">
                        All ({stats.total})
                      </TabsTrigger>
                      <TabsTrigger value="active" className="data-[state=active]:bg-white">
                        Active ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger value="inactive" className="data-[state=active]:bg-white">
                        Inactive ({stats.inactive})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by Faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Filter by Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Student Table */}
                {filteredStudents.length > 0 ? (
                  <StudentTable
                    students={filteredStudents}
                    onActivate={handleActivate} // uses boolean now
                    onDelete={handleDelete}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 bg-gray-100 rounded-full mb-4">
                      <AlertCircle className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
                    <p className="text-gray-600 max-w-md">
                      {searchTerm || facultyFilter || departmentFilter || levelFilter
                        ? "Try adjusting your search or filter criteria."
                        : "No students are currently registered in the system."}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
