"use client"

import { useState, useEffect } from "react"
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  KeyRound,
  UserCircle2,
  Search,
  Edit3,
  Save,
  X,
  Phone,
  Mail,
  Hash,
  GraduationCap,
  Building,
  Users,
} from "lucide-react"
import { getStudentFromToken, logoutStudent } from "@/utils/auth"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PushNotificationButton } from "@/components/push-notification-button"
import { Megaphone } from "lucide-react"
import { useTheme } from "@/contexts/ThemeContext"

interface Student {
  name: string
  email: string
  matricNumber: string
  faculty: { _id: string; name: string }
  department: { _id: string; name: string }
  level: { _id: string; name: string }
  isActive: boolean
  phoneNumber?: string
}

interface Course {
  _id: string
  name: string
  code: string
  facultyId: string
  departmentId: string
  levelId: string
}

export default function ProfilePage() {
  const [student, setStudent] = useState<Student | null>(null)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [relevantCourses, setRelevantCourses] = useState<Course[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showRelevant, setShowRelevant] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [editingPhone, setEditingPhone] = useState(false)
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [showPasswordConfirmModal, setShowPasswordConfirmModal] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<"Weak" | "Medium" | "Strong" | "Very Strong" | "">("")
  const [passwordFeedback, setPasswordFeedback] = useState<string[]>([])
  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])
  const [levels, setLevels] = useState<{ _id: string; name: string }[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [selectedLevel, setSelectedLevel] = useState("")
  const [savingInstitutionalInfo, setSavingInstitutionalInfo] = useState(false)
  const [isEditingInstitutionalInfo, setIsEditingInstitutionalInfo] = useState(false)
  const [countryCode, setCountryCode] = useState("+234")
  const [localNumber, setLocalNumber] = useState("")
  useTheme()

  // Get student from token and fetch their data
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const tokenStudent = await getStudentFromToken()
        if (!tokenStudent?.matricNumber) return
        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber)
        const res = await fetch(`/api/students/${encodedMatric}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || "Failed to fetch")
        setStudent({
          ...data,
          isActive: data.isActive === "True" || data.isActive === true,
        })
        setSelectedFaculty(data.faculty?._id || "")
        setSelectedDepartment(data.department?._id || "")
        setSelectedLevel(data.level?._id || "")
        const number = data.phoneNumber || ""
        setPhoneNumber(number)
        setCountryCode(getCountryCode(number))
        setLocalNumber(getLocalNumber(number))
      } catch (err) {
        console.error("Failed to fetch student", err)
      }
    }

    fetchStudentDetails()
  }, [])

  // Fetch all courses and derive relevant + searchable ones
  useEffect(() => {
    const fetchCourses = async () => {
      if (!student?.faculty) return
      try {
        const res = await fetch("/api/courses")
        const courses: Course[] = await res.json()
        setAllCourses(courses)
        const relevant = courses.filter((course) => course.facultyId === student.faculty._id)
        setRelevantCourses(relevant)
      } catch (err) {
        console.error("Error fetching courses", err)
      }
    }

    if (student) fetchCourses()
  }, [student])

  useEffect(() => {
    fetch("/api/faculties")
      .then((res) => res.json())
      .then(setFaculties)
      .catch(() => toast.error("Failed to load faculties."))
  }, [])

  useEffect(() => {
    if (!selectedFaculty) return
    fetch(`/api/departments?facultyId=${selectedFaculty}`)
      .then((res) => res.json())
      .then(setDepartments)
      .catch(() => toast.error("Failed to load departments."))
  }, [selectedFaculty])

  useEffect(() => {
    if (!selectedDepartment) return
    fetch(`/api/levels?departmentId=${selectedDepartment}`)
      .then((res) => res.json())
      .then((data) => setLevels(Array.isArray(data?.levels) ? data.levels : []))
      .catch(() => toast.error("Failed to load levels."))
  }, [selectedDepartment])

  useEffect(() => {
    if (editingPhone) {
      setPhoneNumber(`${countryCode}${localNumber}`)
    }
  }, [countryCode, localNumber, editingPhone])

  useEffect(() => {
    if (!editingPhone && student?.phoneNumber) {
      setCountryCode(getCountryCode(student.phoneNumber))
      setLocalNumber(getLocalNumber(student.phoneNumber))
    }
  }, [editingPhone, student])

  const handleSaveInstitutionalInfo = async () => {
    if (!student?.matricNumber || !selectedFaculty || !selectedDepartment || !selectedLevel) {
      toast.error("Please select all institutional information.")
      return
    }

    setSavingInstitutionalInfo(true)
    try {
      const res = await fetch("/api/students/set-institutional-info", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber: student.matricNumber,
          facultyId: selectedFaculty,
          departmentId: selectedDepartment,
          levelId: selectedLevel,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        if (data.message === "No changes detected") {
          toast.info("No updates were made. Info is already up to date.")
        } else {
          toast.success("Institutional info updated successfully!")
        }
        setStudent((prev) =>
          prev
            ? {
                ...prev,
                faculty: faculties.find((f) => f._id === selectedFaculty)!,
                department: departments.find((d) => d._id === selectedDepartment)!,
                level: levels.find((l) => l._id === selectedLevel)!,
              }
            : null,
        )
        setIsEditingInstitutionalInfo(false)
      } else {
        toast.error(data.error || "Update failed")
      }
    } catch (error) {
      console.error("Error Saving data:", error)
      toast.error("Error saving data.")
    } finally {
      setSavingInstitutionalInfo(false)
    }
  }

  const handleChangePassword = async () => {
    if (!newPassword) {
      toast.error("Please enter a new password")
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
    if (!passwordRegex.test(newPassword)) {
      toast.error("Password must include uppercase, lowercase, number, and special character.")
      return
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      })
      const result = await res.json()
      if (res.ok) {
        toast.success("Password changed successfully. Logging out...")
        setNewPassword("")
        setIsLoggingOut(true)
        setTimeout(async () => {
          await logoutStudent()
          router.push("/auth/login")
        }, 1500)
      } else {
        toast.error(result.error || "Failed to change password")
      }
    } catch (error) {
      console.error("Something went wrong:", error)
      toast.error("Something went wrong")
    }
  }

  const handleUpdatePhoneNumber = async () => {
    if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber)) {
      toast.error("Please enter a valid phone number (10–15 digits, optional '+').")
      return
    }

    if (!student?.matricNumber) {
      toast.error("Matric number missing. Cannot update.")
      return
    }

    try {
      const res = await fetch("/api/students/update-phone", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matricNumber: student.matricNumber,
          phoneNumber: phoneNumber.trim(),
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        toast.error(result.error || "Failed to update phone number.")
        return
      }
      toast.success("Phone number updated!")
      setEditingPhone(false)
    } catch (err) {
      console.error("Error updating phone number:", err)
      toast.error("An error occurred while updating.")
    }
  }

  const otherCourses = allCourses.filter((course) => course.facultyId !== student?.faculty._id)

  const filteredSearchResults = otherCourses.filter((course) =>
    `${course.code} ${course.name}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const evaluatePassword = (password: string) => {
    const feedback: string[] = []
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecialChar = /[\W_]/.test(password)
    const isLongEnough = password.length >= 8

    if (!hasUpperCase) feedback.push("Add at least one uppercase letter.")
    if (!hasLowerCase) feedback.push("Add at least one lowercase letter.")
    if (!hasNumber) feedback.push("Add at least one number.")
    if (!hasSpecialChar) feedback.push("Add at least one special character.")
    if (!isLongEnough) feedback.push("Password must be at least 8 characters long.")

    let strength: "" | "Weak" | "Medium" | "Strong" | "Very Strong" = ""
    const passedChecks = [hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar, isLongEnough].filter(Boolean).length

    switch (passedChecks) {
      case 5:
        strength = "Very Strong"
        break
      case 4:
        strength = "Strong"
        break
      case 3:
        strength = "Medium"
        break
      default:
        strength = "Weak"
    }

    setPasswordStrength(strength)
    setPasswordFeedback(feedback)
  }

  const getCountryCode = (number: string) => number.match(/^\+\d+/)?.[0] || "+234"
  const getLocalNumber = (number: string) => number.replace(/^\+\d+/, "").replace(/\D/g, "")

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 dark:text-gray-300">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Student Profile</h1>
        <p className="text-slate-600 dark:text-gray-300">Manage your personal information and academic details</p>
      </div>

      <div className="grid gap-8 max-w-4xl mx-auto">
        {/* Personal Information Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-sm transition-colors duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 dark:bg-neutral-800 rounded-full">
                  <UserCircle2 className="h-6 w-6 text-slate-700 dark:text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">Personal Information</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Your basic profile details</p>
                </div>
              </div>
              {!isEditingInstitutionalInfo ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingInstitutionalInfo(true)}
                  className="border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors duration-300"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveInstitutionalInfo}
                    disabled={savingInstitutionalInfo}
                    className="bg-slate-900 dark:bg-neutral-800 hover:bg-slate-800 dark:hover:bg-neutral-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {savingInstitutionalInfo ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingInstitutionalInfo(false)
                      setSelectedFaculty(student.faculty?._id || "")
                      setSelectedDepartment(student.department?._id || "")
                      setSelectedLevel(student.level?._id || "")
                    }}
                    className="border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors duration-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                  <UserCircle2 className="h-4 w-4" />
                  Full Name
                </div>
                <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.name}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                  <Hash className="h-4 w-4" />
                  Matric Number
                </div>
                <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.matricNumber}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.email}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </div>
                <div className="flex items-center gap-2">
                  {editingPhone ? (
                    <>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="text-slate-900 dark:text-white text-sm rounded-lg px-3 py-2 border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      >
                        <option value="+234">🇳🇬 +234</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      <Input
                        type="tel"
                        value={localNumber}
                        onChange={(e) => setLocalNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter phone number"
                        className="flex-1 border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white"
                      />
                      <Button size="sm" onClick={handleUpdatePhoneNumber} className="bg-slate-900 dark:bg-neutral-800 hover:bg-slate-800 dark:hover:bg-neutral-700 text-white">
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg flex-1">
                        {student.phoneNumber || "Not provided"}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPhone(true)}
                        className="border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors duration-300"
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="border-t border-slate-200 dark:border-neutral-700 pt-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 dark:text-white" />
                Academic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                    <Building className="h-4 w-4" />
                    Faculty
                  </div>
                  {isEditingInstitutionalInfo ? (
                    <Select onValueChange={setSelectedFaculty} value={selectedFaculty}>
                      <SelectTrigger className="border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white">
                        <SelectValue placeholder="Select Faculty" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-neutral-900 dark:text-white">
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty._id} value={faculty._id} className="dark:text-white">
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.faculty?.name || "N/A"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                    <Users className="h-4 w-4" />
                    Department
                  </div>
                  {isEditingInstitutionalInfo ? (
                    <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
                      <SelectTrigger className="border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-neutral-900 dark:text-white">
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept._id} className="dark:text-white">
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.department?.name || "N/A"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-white">
                    <GraduationCap className="h-4 w-4" />
                    Level
                  </div>
                  {isEditingInstitutionalInfo ? (
                    <Select onValueChange={setSelectedLevel} value={selectedLevel}>
                      <SelectTrigger className="border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white">
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent className="dark:bg-neutral-900 dark:text-white">
                        {levels.map((level) => (
                          <SelectItem key={level._id} value={level._id} className="dark:text-white">
                            {level.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-neutral-800 p-3 rounded-lg">{student.level?.name || "N/A"}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${student.isActive ? "bg-green-500" : "bg-red-500"}`} />
                <span className="text-sm text-slate-600 dark:text-gray-300">
                  Account Status:{" "}
                  <span className={student.isActive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-sm transition-colors duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-700 dark:text-blue-200" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Course Information</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Your relevant courses and search for others</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Relevant Courses */}
            <div>
              <button
                className="flex items-center justify-between w-full p-4 bg-slate-50 dark:bg-neutral-800 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => setShowRelevant(!showRelevant)}
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-slate-700 dark:text-white" />
                  <span className="font-medium text-slate-900 dark:text-white">Your Faculty Courses ({relevantCourses.length})</span>
                </div>
                {showRelevant ? (
                  <ChevronUp className="h-5 w-5 text-slate-500 dark:text-gray-300" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-500 dark:text-gray-300" />
                )}
              </button>

              {showRelevant && (
                <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
                  {relevantCourses.map((course) => (
                    <div key={course._id} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                      <div className="font-medium text-slate-900 dark:text-white">{course.code}</div>
                      <div className="text-sm text-slate-600 dark:text-gray-300">{course.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Other Courses */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-slate-700 dark:text-white" />
                <h3 className="font-medium text-slate-900 dark:text-white">Search Other Courses</h3>
              </div>
              <Input
                type="text"
                placeholder="Search by course name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white"
              />
              {searchTerm && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredSearchResults.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-gray-400 py-4">No courses found matching your search.</p>
                  ) : (
                    filteredSearchResults.map((course) => (
                      <div key={course._id} className="p-3 bg-slate-50 dark:bg-neutral-800 rounded-lg border border-slate-200 dark:border-neutral-700">
                        <div className="font-medium text-slate-900 dark:text-white">{course.code}</div>
                        <div className="text-sm text-slate-600 dark:text-gray-300">{course.name}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-sm transition-colors duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Megaphone className="h-6 w-6 text-blue-700 dark:text-blue-200" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Notifications</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Manage your push notification preferences</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <PushNotificationButton />
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="shadow-xl border-0 bg-white/80 dark:bg-neutral-900 dark:border-neutral-800 backdrop-blur-sm transition-colors duration-300">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <KeyRound className="h-6 w-6 text-red-700 dark:text-red-300" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Security Settings</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Update your password and security preferences</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => {
                  const pwd = e.target.value
                  setNewPassword(pwd)
                  evaluatePassword(pwd)
                }}
                className="border-slate-200 dark:border-neutral-700 focus:border-slate-400 dark:focus:border-neutral-500 dark:bg-neutral-800 dark:text-white"
              />

              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-white">Password Strength:</span>
                    <span
                      className={`text-sm font-medium ${
                        passwordStrength === "Very Strong"
                          ? "text-green-600 dark:text-green-400"
                          : passwordStrength === "Strong"
                            ? "text-green-500 dark:text-green-300"
                            : passwordStrength === "Medium"
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {passwordStrength}
                    </span>
                  </div>
                  {passwordFeedback.length > 0 && (
                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                      {passwordFeedback.map((msg, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-red-600 dark:bg-red-400 rounded-full" />
                          {msg}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <Button
                onClick={() => setShowPasswordConfirmModal(true)}
                disabled={!newPassword || passwordStrength === "Weak"}
                className="w-full bg-slate-900 dark:bg-red-700 hover:bg-slate-800 dark:hover:bg-red-800 text-white"
              >
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Confirmation Modal */}
      {showPasswordConfirmModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-md p-6 space-y-4 transition-colors duration-300">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
                <KeyRound className="h-6 w-6 text-red-600 dark:text-red-300" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Confirm Password Change</h2>
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Changing your password will immediately log you out. You&apos;ll need to sign in again with your new
                password.
              </p>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowPasswordConfirmModal(false)}
                className="flex-1 border-slate-200 dark:border-neutral-700 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-800 transition-colors duration-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setShowPasswordConfirmModal(false)
                  handleChangePassword()
                }}
                className="flex-1 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 text-white"
              >
                Change Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Loading Modal */}
      {isLoggingOut && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl p-6 text-center space-y-4 transition-colors duration-300">
            <div className="w-8 h-8 border-4 border-slate-300 dark:border-neutral-700 border-t-slate-900 dark:border-t-white rounded-full animate-spin mx-auto" />
            <p className="text-slate-900 dark:text-white font-medium">Logging you out...</p>
          </div>
        </div>
      )}
    </div>
  )
}