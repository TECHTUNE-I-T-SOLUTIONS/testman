"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import {
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TrendingUp,
  BarChart3,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Student {
  _id: string
  name: string
  email: string
  averageScore?: number
}

interface ActivityItem {
  id: number
  action: string
  time: string
  status: "success" | "info" | "warning" | string
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const [currentTime, setCurrentTime] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [showNeedingHelp, setShowNeedingHelp] = useState(false)
  const [needingHelpStudents, setNeedingHelpStudents] = useState<Student[]>([])
  const [dashboardStats, setDashboardStats] = useState<{
    totalStudents: number
    totalCourses: number
    activeExams: number
    completedExams: number
    studentProgress: number
    recentActivities: ActivityItem[]
    needingHelpCount: number
  }>({
    totalStudents: 0,
    totalCourses: 0,
    activeExams: 0,
    completedExams: 0,
    studentProgress: 0,
    recentActivities: [],
    needingHelpCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString())
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    )
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/dashboard/stats")
        const statsData = await statsRes.json()
        setDashboardStats({
          totalStudents: statsData.totalStudents,
          totalCourses: statsData.totalCourses,
          activeExams: statsData.activeExams,
          completedExams: statsData.completedExams,
          studentProgress: statsData.averageScore,
          recentActivities: statsData.recentActivities,
          needingHelpCount: statsData.needingHelpCount,
        })
        setNeedingHelpStudents(statsData.needingHelpDetails || [])
        setLoading(false)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 text-gray-900 animate-spin mx-auto" />
          <h3 className="text-xl font-medium text-gray-900">Loading Dashboard</h3>
          <p className="text-gray-600">Please wait while we fetch your data...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center space-y-6">
          <div className="p-4 bg-red-50 rounded-full w-fit mx-auto">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600 mb-6">You don&apos;t have permission to access this page</p>
            <Button asChild className="bg-gray-900 hover:bg-gray-800">
              <a href="/login">Return to Login</a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Extract details
  const adminEmail = session.user?.email ?? "admin@example.com"
  const adminName = session.user?.name ?? "Admin User"
  const adminRole = session.user?.role ?? "Admin"
  const adminMatric = session.user?.matricNumber ?? "ADMIN-2023-001"

  // Capitalize role for display
  const displayRole = adminRole.charAt(0).toUpperCase() + adminRole.slice(1).toLowerCase()

  const statsCards = [
    {
      title: "Total Students",
      value: dashboardStats.totalStudents,
      change: "+24 from last month",
      icon: Users,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      iconColor: "text-blue-600",
      trend: "up",
    },
    {
      title: "Total Courses",
      value: dashboardStats.totalCourses,
      change: "+3 new this semester",
      icon: BookOpen,
      color: "bg-green-50 border-green-200 text-green-800",
      iconColor: "text-green-600",
      trend: "up",
    },
    {
      title: "Active Exams",
      value: dashboardStats.activeExams,
      change: "Ongoing within last 10 hours",
      icon: GraduationCap,
      color: "bg-yellow-50 border-yellow-200 text-yellow-800",
      iconColor: "text-yellow-600",
      trend: "neutral",
    },
    {
      title: "Completed Exams",
      value: dashboardStats.completedExams,
      change: "Based on exam timestamps",
      icon: CheckCircle2,
      color: "bg-purple-50 border-purple-200 text-purple-800",
      iconColor: "text-purple-600",
      trend: "up",
    },
  ]

  const quickActions = [
    {
      title: "Manage Students",
      description: "View and manage student accounts",
      href: "/dashboard/super-admin/manage-students",
      icon: Users,
      color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    },
    {
      title: "Manage Courses",
      description: "Add and edit course content",
      href: "/dashboard/super-admin/manage-academics/courses",
      icon: BookOpen,
      color: "bg-green-50 hover:bg-green-100 border-green-200",
    },
    {
      title: "Create Exam",
      description: "Set up new examinations",
      href: "/dashboard/super-admin/manage-questions/exams",
      icon: GraduationCap,
      color: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
    },
    {
      title: "Manage Results",
      description: "View and analyze exam results",
      href: "/dashboard/super-admin/manage-questions/results",
      icon: BarChart3,
      color: "bg-purple-50 hover:bg-purple-100 border-purple-200",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-8 p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2 text-lg">
              Welcome back, {displayRole === "Super-admin" ? "Super Admin" : displayRole} {adminName}
            </p>
          </div>

          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-gray-200">
                  <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Admin" />
                  <AvatarFallback className="bg-gray-900 text-white font-semibold">
                    {adminName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{currentDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Clock className="h-4 w-4" />
                    <span>{currentTime}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Info Card */}
        <Card className="border-l-4 border-l-gray-900 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 bg-gray-900 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              Administrator Information
            </CardTitle>
            <CardDescription>Your account details and access level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{adminEmail}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Admin ID</p>
                <p className="font-medium text-gray-900">{adminMatric}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Access Level</p>
                <Badge className="bg-gray-900 text-white hover:bg-gray-800">{displayRole}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card key={index} className={`border-2 ${stat.color} hover:shadow-md transition-shadow`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${stat.iconColor}`} />
                    {stat.trend === "up" && <ArrowUpRight className="h-4 w-4 text-green-600" />}
                    {stat.trend === "down" && <ArrowDownRight className="h-4 w-4 text-red-600" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs opacity-80">{stat.change}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Progress and Activities */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Student Progress */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Student Progress
              </CardTitle>
              <CardDescription>Average performance across all students</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Progress</span>
                  <span className="text-sm font-medium">{dashboardStats.studentProgress}%</span>
                </div>
                <Progress value={dashboardStats.studentProgress} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-red-600">{dashboardStats.needingHelpCount} students need help</div>
                {dashboardStats.needingHelpCount > 0 && (
                  <Button variant="outline" size="sm" onClick={() => setShowNeedingHelp(!showNeedingHelp)}>
                    <Eye className="h-4 w-4 mr-2" />
                    {showNeedingHelp ? "Hide" : "View Details"}
                  </Button>
                )}
              </div>

              {showNeedingHelp && (
                <Card className="border-l-4 border-l-red-500 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Students Needing Help</CardTitle>
                    <CardDescription>These students may require academic support</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {needingHelpStudents?.length === 0 ? (
                      <p className="text-gray-600 text-sm">No students currently flagged as needing help.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-3">
                        {needingHelpStudents.map((student: Student) => (
                          <div
                            key={student._id}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border"
                          >
                            <div>
                              <p className="font-medium text-sm">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                            <Badge variant="destructive" className="text-xs">
                              Avg: {student.averageScore?.toFixed(1)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-600" />
                Recent Activities
              </CardTitle>
              <CardDescription>Track changes and recent actions</CardDescription>
            </CardHeader>
            <CardContent>
              {dashboardStats.recentActivities.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent activities found.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-64 overflow-y-auto">
                  {dashboardStats.recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-1 bg-gray-900 rounded-full">
                        <Activity className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-gray-600" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon
                return (
                  <Link key={index} href={action.href}>
                    <Card
                      className={`border-2 ${action.color} hover:shadow-md transition-all duration-200 cursor-pointer h-full`}
                    >
                      <CardContent className="p-6 text-center space-y-4">
                        <div className="p-3 bg-white rounded-full w-fit mx-auto">
                          <IconComponent className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                          <p className="text-sm text-gray-600">{action.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
