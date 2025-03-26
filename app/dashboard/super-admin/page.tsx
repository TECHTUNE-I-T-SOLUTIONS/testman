"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { BarChart3, Users, BookOpen, GraduationCap, Calendar, Clock, ArrowUpRight, Activity, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const [currentTime, setCurrentTime] = useState<string>("")
  const [currentDate, setCurrentDate] = useState<string>("")

  useEffect(() => {
    // Update time every second
    const timeInterval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString())
      setCurrentDate(now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }))
    }, 1000)
    
    // Initial set
    const now = new Date()
    setCurrentTime(now.toLocaleTimeString())
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
    
    return () => clearInterval(timeInterval)
  }, [])

  // Mock data for dashboard
  const dashboardStats = {
    totalStudents: 1245,
    totalCourses: 87,
    activeExams: 12,
    completedExams: 156,
    studentProgress: 78,
    recentActivities: [
      { id: 1, action: "New student registered", time: "10 minutes ago", status: "success" },
      { id: 2, action: "Exam CSC301 published", time: "1 hour ago", status: "success" },
      { id: 3, action: "System maintenance scheduled", time: "2 hours ago", status: "warning" },
      { id: 4, action: "New course materials uploaded", time: "Yesterday", status: "success" },
    ]
  }

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading dashboard...</h3>
        <p className="text-muted-foreground">Please wait while we fetch your data</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-medium">Access Denied</h3>
        <p className="text-muted-foreground mb-6">You don&apos;t have permission to access this page</p>
        <Button asChild>
          <a href="/login">Return to Login</a>
        </Button>
      </div>
    )
  }

  const adminEmail = session.user?.email ?? "admin@example.com"
  const adminName = session.user?.name ?? "Admin User"
  const matricNumber = session.user?.matricNumber ?? "ADMIN-2023-001"

  return (
    <div className="flex-1 space-y-6 p-6 md:p-8">
      {/* Header with welcome message and time */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {adminName}</p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
            <AvatarFallback>{adminName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Admin info card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle>Administrator Information</CardTitle>
          <CardDescription>Your account details and access level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{adminEmail}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Admin ID</p>
              <p className="font-medium">{matricNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Access Level</p>
              <Badge className="bg-primary">Super Admin</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200 dark:border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dashboardStats.totalStudents}</div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">+24 from last month</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{dashboardStats.totalCourses}</div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">+3 new courses added</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <GraduationCap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">{dashboardStats.activeExams}</div>
            <p className="text-xs text-amber-600/80 dark:text-amber-400/80">Across 5 departments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{dashboardStats.completedExams}</div>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* Student progress and recent activity */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Student Progress</CardTitle>
            <CardDescription>Average completion rate across all courses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span className="font-medium">Overall Completion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{dashboardStats.studentProgress}%</span>
                  <div className="flex items-center text-green-600">
                    <ArrowUpRight className="h-4 w-4" />
                    <span className="text-xs">5%</span>
                  </div>
                </div>
              </div>
              <Progress value={dashboardStats.studentProgress} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-medium">Excellent</div>
                  <div className="text-muted-foreground">42%</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-medium">Average</div>
                  <div className="text-muted-foreground">35%</div>
                </div>
                <div className="rounded-lg bg-muted p-2">
                  <div className="font-medium">Needs Help</div>
                  <div className="text-muted-foreground">23%</div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View Detailed Reports</Button>
          </CardFooter>
        </Card>
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions and system updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="mr-4 rounded-full bg-primary/10 p-2">
                    {activity.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Activity</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-auto flex flex-col items-center justify-center py-4 space-y-2">
              <Users className="h-6 w-6 mb-2" />
              <span>Manage Students</span>
            </Button>
            <Button className="h-auto flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
              <BookOpen className="h-6 w-6 mb-2" />
              <span>Manage Courses</span>
            </Button>
            <Button className="h-auto flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
              <GraduationCap className="h-6 w-6 mb-2" />
              <span>Create Exam</span>
            </Button>
            <Button className="h-auto flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
              <Activity className="h-6 w-6 mb-2" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}