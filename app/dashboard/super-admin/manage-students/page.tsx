"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react";
import { Search, Users, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import StudentTable from "@/components/dashboard/manage-students/StudentTable"

// Updated Student Type
export type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string };
  isActive: boolean; // Changed from string to boolean
};


export default function ManageStudents() {
  const { data: session } = useSession(); // ✅ GET SESSION  
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
    if (!session?.user?.email) return; // Wait for session to load

    async function fetchStudents() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/students?email=${session.user.email}`);
        if (!res.ok) throw new Error("Failed to fetch students");

        const rawData: Student[] = await res.json();

        const data = rawData.map(student => ({
          ...student,
          isActive: student.isActive === true,
        }));

        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        setError("Failed to load students. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [session]); // ✅ Rerun when session is loaded

  useEffect(() => {
    let filtered = students;

    // Apply tab filter (active/inactive/all)
    if (activeTab === "active") {
      filtered = filtered.filter((student) => student.isActive === true);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter((student) => student.isActive === false);
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

    setFilteredStudents(filtered);
  }, [facultyFilter, departmentFilter, levelFilter, students, searchTerm, activeTab]);

  // Toggle isActive Status
  const handleActivate = async (id: string, newStatus: boolean) => {
    try {
      await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: newStatus }),
      })

      setStudents((prev) =>
        prev.map((student) =>
          student._id === id ? { ...student, isActive: newStatus } : student
        )
      )
    } catch (error) {
      console.error("Failed to update student status:", error)
    }
  }

  const handleActivateAll = async () => {
    const allActive = students.every((s) => s.isActive);
    if (allActive) {
      toast.info("All students are already active");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activateAll: true }),
      });

      if (!res.ok) throw new Error("Failed to activate all students");

      const updatedStudents = await res.json();
      setStudents(updatedStudents);
      toast.success("All students activated successfully");
    } catch (err) {
      console.error("Error activating all students:", err);
      toast.error("Failed to activate all students");
    }
  };

  const handleDeactivateAll = async () => {
    const allInactive = students.every((s) => !s.isActive);
    if (allInactive) {
      toast.info("All students are already inactive");
      return;
    }

    try {
      const res = await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deactivateAll: true }),
      });

      if (!res.ok) throw new Error("Failed to deactivate all students");

      const updatedStudents = await res.json();
      setStudents(updatedStudents);
      toast.success("All students deactivated successfully");
    } catch (err) {
      console.error("Error deactivating all students:", err);
      toast.error("Failed to deactivate all students");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })

      setStudents((prev) => prev.filter((student) => student._id !== id))
    } catch (error) {
      console.error("Failed to delete student:", error)
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
    <div className="space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Manage Students
          </h1>
          <p className="text-muted-foreground mt-1">
            View, filter, and manage student accounts
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={resetFilters} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Filters
          </Button>
          <Button
            onClick={handleActivateAll}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Activate All
          </Button>
          <Button
            onClick={handleDeactivateAll}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Deactivate All
          </Button>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        {/* Active Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Badge
              variant="outline"
              className="bg-green-100 text-green-800 hover:bg-green-100"
            >
              Active
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>

        {/* Inactive Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <Badge
              variant="outline"
              className="bg-red-100 text-red-800 hover:bg-red-100"
            >
              Inactive
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content */}
      {loading ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>
              {filteredStudents.length} {filteredStudents.length === 1 ? "student" : "students"} found
              {searchTerm && ` for "${searchTerm}"`}
              {(facultyFilter || departmentFilter || levelFilter) && " with applied filters"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Filters and Search */}              
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email or matric number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>              
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="inactive">Inactive</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
                  <Select value={facultyFilter} onValueChange={setFacultyFilter}>
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Faculty" />
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
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Department" />
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
                    <SelectTrigger className="w-full md:w-[150px]">
                      <SelectValue placeholder="Level" />
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
              </div>

              {/* Student Table */}
              {filteredStudents.length > 0 ? (
                <StudentTable
                  students={filteredStudents}
                  onActivate={handleActivate} // uses boolean now
                  onDelete={handleDelete}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Students Found</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
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
  )
}
