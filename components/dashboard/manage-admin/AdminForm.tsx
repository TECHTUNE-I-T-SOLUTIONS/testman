"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { UserPlus, Eye, EyeOff, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface AdminFormProps {
  fetchAdmins: () => void
}

interface AdminFormData {
  matricNumber: string
  email: string
  password: string
  role: "Admin" | "Sub-Admin"
  assignedFaculty?: string
  assignedDepartment?: string
}

export default function AdminForm({ fetchAdmins }: AdminFormProps) {
  const { data: session } = useSession()
  const currentUserRole = session?.user?.role
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    defaultValues: { role: "Admin" },
  })

  const role = watch("role")
  const [loading, setLoading] = useState(false)
  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])

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
        console.error("Error fetching faculties or departments", error)
        toast.error("Error fetching faculties or departments")
      }
    }
    fetchData()
  }, [])

  // Reset assigned fields when role changes
  useEffect(() => {
    setValue("assignedFaculty", undefined)
    setValue("assignedDepartment", undefined)
  }, [role, setValue])

  // Force role to "Sub-Admin" if current user is Admin
  useEffect(() => {
    if (currentUserRole === "Admin") {
      setValue("role", "Sub-Admin")
    }
  }, [currentUserRole, setValue])

  const onSubmit = async (data: AdminFormData) => {
    try {
      setLoading(true)
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to create admin")
      toast.success("Admin created successfully!")
      fetchAdmins()
      reset()
    } catch (error) {
      console.error("Error creating admin", error)
      toast.error("Error creating admin")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Create Administrator
        </CardTitle>
        <CardDescription>Add a new admin or sub-admin to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Matric Number */}
          <div className="space-y-2">
            <Label htmlFor="matricNumber">Matric Number</Label>
            <Input
              id="matricNumber"
              {...register("matricNumber", { required: "Matric number is required" })}
              placeholder="Enter Matric Number"
              className={errors.matricNumber ? "border-destructive" : ""}
            />
            {errors.matricNumber && <p className="text-sm text-destructive">{errors.matricNumber.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register("email", { required: "Email is required" })}
              placeholder="Enter Email Address"
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...register("password", { required: "Password is required" })}
                placeholder="Enter Password"
                className={errors.password ? "border-destructive pr-10" : "pr-10"}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(value: "Admin" | "Sub-Admin") => setValue("role", value)}
              disabled={currentUserRole === "Admin"}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {currentUserRole === "super-admin" ? (
                  <>
                    <SelectItem value="Admin">
                      <div className="flex items-center gap-2">
                        Admin
                        <Badge variant="secondary" className="text-xs">
                          Faculty Access
                        </Badge>
                      </div>
                    </SelectItem>
                    <SelectItem value="Sub-Admin">
                      <div className="flex items-center gap-2">
                        Sub-Admin
                        <Badge variant="outline" className="text-xs">
                          Department Access
                        </Badge>
                      </div>
                    </SelectItem>
                  </>
                ) : (
                  <SelectItem value="Sub-Admin">
                    <div className="flex items-center gap-2">
                      Sub-Admin
                      <Badge variant="outline" className="text-xs">
                        Department Access
                      </Badge>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Faculty Assignment */}
          {role === "Admin" && currentUserRole === "super-admin" && (
            <div className="space-y-2">
              <Label>Assigned Faculty</Label>
              <Select onValueChange={(value) => setValue("assignedFaculty", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedFaculty && <p className="text-sm text-destructive">{errors.assignedFaculty.message}</p>}
            </div>
          )}

          {/* Conditional Department Assignment */}
          {role === "Sub-Admin" && (
            <div className="space-y-2">
              <Label>Assigned Department</Label>
              <Select onValueChange={(value) => setValue("assignedDepartment", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedDepartment && (
                <p className="text-sm text-destructive">{errors.assignedDepartment.message}</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Administrator...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Administrator
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
