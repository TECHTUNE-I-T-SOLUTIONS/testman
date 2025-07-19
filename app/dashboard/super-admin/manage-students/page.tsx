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
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors duration-300">
      <div className="space-y-8 p-2 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:gap-6 lg:flex-row justify-between items-start lg:items-center">
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
              <div className="p-2 bg-gray-900 dark:bg-gray-100 rounded-lg">
                <Users className="h-8 w-8 text-white dark:text-gray-900" />
              </div>
              <span>Manage Students</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-base sm:text-lg">
              View, filter, and manage student accounts
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex items-center gap-2 bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Filters
            </Button>
            <Button
              onClick={handleActivateAll}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white flex items-center gap-2 transition"
            >
              <UserCheck className="h-4 w-4" />
              Activate All
            </Button>
            <Button
              onClick={handleDeactivateAll}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white flex items-center gap-2 transition"
            >
              <UserX className="h-4 w-4" />
              Deactivate All
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          <Card className="bg-white dark:bg-neutral-900 shadow-sm border-l-4 border-l-blue-500 dark:border-l-blue-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Students</CardTitle>
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Registered students</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 shadow-sm border-l-4 border-l-green-500 dark:border-l-green-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Students</CardTitle>
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.active}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Can access platform</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-neutral-900 shadow-sm border-l-4 border-l-red-500 dark:border-l-red-600 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Inactive Students</CardTitle>
              <UserX className="h-5 w-5 text-red-600 dark:text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.inactive}</div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Restricted access</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {loading ? (
          <Card className="bg-white dark:bg-neutral-900 shadow-sm transition-colors">
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
          <Alert variant="destructive" className="bg-white dark:bg-neutral-900 border border-red-200 dark:border-red-800">
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle className="text-gray-900 dark:text-gray-100">Error Loading Students</AlertTitle>
            <AlertDescription className="text-gray-700 dark:text-gray-300">{error}</AlertDescription>
          </Alert>
        ) : (
          <Card className="bg-white dark:bg-neutral-900 shadow-sm transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                Student Management
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-300">
                {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
                {searchTerm && ` for "${searchTerm}"`}
                {(facultyFilter || departmentFilter || levelFilter) && " with applied filters"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Search and Filters */}
                <div className="flex flex-col gap-3 sm:gap-4 lg:flex-row">
                  {/* Search */}
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <Input
                      placeholder="Search by name, email or matric number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition"
                    />
                  </div>

                  {/* Status Tabs */}
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-gray-100 p-6 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg flex w-full sm:w-auto">
                      <TabsTrigger
                        value="all"
                        className="data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-900 data-[state=active]:text-blue-600 data-[state=active]:dark:text-blue-400 text-gray-700 dark:text-gray-200 px-3 py-2 transition"
                      >
                        All ({stats.total})
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-900 data-[state=active]:text-green-600 data-[state=active]:dark:text-green-400 text-gray-700 dark:text-gray-200 px-3 py-2 transition"
                      >
                        Active ({stats.active})
                      </TabsTrigger>
                      <TabsTrigger
                        value="inactive"
                        className="data-[state=active]:bg-white data-[state=active]:dark:bg-neutral-900 data-[state=active]:text-red-600 data-[state=active]:dark:text-red-400 text-gray-700 dark:text-gray-200 px-3 py-2 transition"
                      >
                        Inactive ({stats.inactive})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Filter Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                    <SelectTrigger className="h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition">
                      <SelectValue placeholder="Filter by Faculty" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700">
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>
                          {faculty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition">
                      <SelectValue placeholder="Filter by Department" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700">
                      {departments.map((department) => (
                        <SelectItem key={department} value={department}>
                          {department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={levelFilter} onValueChange={setLevelFilter}>
                    <SelectTrigger className="h-12 bg-white dark:bg-neutral-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition">
                      <SelectValue placeholder="Filter by Level" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-neutral-900 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-neutral-700">
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
                    <div className="p-4 bg-gray-100 dark:bg-neutral-800 rounded-full mb-4">
                      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Students Found</h3>
                    <p className="text-gray-600 dark:text-gray-300 max-w-md">
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
