"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Student {
  _id: string;
  name: string;
  email: string;
  averageScore?: number;
}

interface ActivityItem {
  id: number;
  action: string;
  time: string;
  status: "success" | "info" | "warning" | string;
}


export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [showNeedingHelp, setShowNeedingHelp] = useState(false);
  const [needingHelpStudents, setNeedingHelpStudents] = useState<Student[]>([]);

  const [dashboardStats, setDashboardStats] = useState<{
    totalStudents: number;
    totalCourses: number;
    activeExams: number;
    completedExams: number;
    studentProgress: number;
    recentActivities: ActivityItem[];
    needingHelpCount: number;
  }>({
    totalStudents: 0,
    totalCourses: 0,
    activeExams: 0,
    completedExams: 0,
    studentProgress: 0,
    recentActivities: [],
    needingHelpCount: 0,
  });


  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    setCurrentTime(now.toLocaleTimeString());
    setCurrentDate(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );

    const interval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("/api/dashboard/stats");

        const statsData = await statsRes.json();

        setDashboardStats({
          totalStudents: statsData.totalStudents,
          totalCourses: statsData.totalCourses,
          activeExams: statsData.activeExams,
          completedExams: statsData.completedExams,
          studentProgress: statsData.averageScore,
          recentActivities: statsData.recentActivities,
          needingHelpCount: statsData.needingHelpCount,
        });
        setNeedingHelpStudents(statsData.needingHelpDetails || []);


        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (status === "loading" || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-xl font-medium">Loading dashboard...</h3>
        <p className="text-muted-foreground">Please wait while we fetch your data</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-medium">Access Denied</h3>
        <p className="text-muted-foreground mb-6">
          You don&apos;t have permission to access this page
        </p>
        <Button asChild>
          <a href="/login">Return to Login</a>
        </Button>
      </div>
    );
  }

  // Extract details
  const adminEmail = session.user?.email ?? "admin@example.com";
  const adminName = session.user?.name ?? "Admin User";
  const adminRole = session.user?.role ?? "Admin";
  const adminMatric = session.user?.matricNumber ?? "ADMIN-2023-001";

  // Capitalize role for display
  const displayRole =
    adminRole.charAt(0).toUpperCase() + adminRole.slice(1).toLowerCase();

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {displayRole === "Super-admin" ? "Super Admin" : displayRole}{" "}
            {adminName}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-muted/50 p-3 rounded-lg">
          <Avatar className="h-10 w-10 border-2 border-primary">
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Admin" />
            <AvatarFallback>
              {adminName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{currentDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">{currentTime}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-2">
          <CardTitle>Administrator Information</CardTitle>
          <CardDescription>Your account details and access level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email Address</p>
              <p className="font-medium">{adminEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Admin ID</p>
              <p className="font-medium">{adminMatric}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Access Level</p>
              <Badge variant="outline" className="capitalize bg-primary text-white">
                {displayRole}
              </Badge>
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
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {dashboardStats.totalStudents}
            </div>
            <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
              +24 from last month
            </p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {dashboardStats.totalCourses}
            </div>
            <p className="text-xs text-green-600/80 dark:text-green-400/80">
              +3 new this semester
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
            <GraduationCap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {dashboardStats.activeExams}
            </div>
            <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
              Ongoing within last 10 hours
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200 dark:border-purple-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Exams</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {dashboardStats.completedExams}
            </div>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
              Based on exam timestamps
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Progress */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle>Student Progress</CardTitle>
          <CardDescription>
            Average performance across all students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={dashboardStats.studentProgress} />
            <div className="text-sm text-muted-foreground">
              {dashboardStats.studentProgress}% average score this term
            </div>
            <div className="flex justify-between items-center">
              <div className="text-sm text-destructive">
                {dashboardStats.needingHelpCount} students need help
              </div>
              {dashboardStats.needingHelpCount > 0 && (
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowNeedingHelp(!showNeedingHelp)}>
                    {showNeedingHelp ? "Hide" : "View More"}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {showNeedingHelp && (
            <Card className="mt-4 border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle>Students Needing Help</CardTitle>
                <CardDescription>These students may require academic support.</CardDescription>
              </CardHeader>
                <CardContent>
                  {needingHelpStudents?.length === 0 ? (
                    <p className="text-muted-foreground">No students currently flagged as needing help.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto pr-2">
                      <ul className="space-y-3">
                        {needingHelpStudents.map((student: Student) => (
                          <li key={student._id} className="flex items-center justify-between bg-muted p-3 rounded-md">
                            <div>
                              <p className="font-medium">{student.name}</p>
                              <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                            <Badge variant="destructive">Average Score: {student.averageScore?.toFixed(2)}</Badge>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Track changes and recent actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dashboardStats.recentActivities.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activities found.</p>
          ) : (
            dashboardStats.recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 border-b pb-2 last:border-b-0 last:pb-0"
              >
                <Activity className="text-primary w-5 h-5 mt-1" />
                <div>
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/super-admin/manage-students">
              <Button className="h-auto w-full flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
                <Users className="h-6 w-6 mb-2" />
                <span>Manage Students</span>
              </Button>
            </Link>
            <Link href="/dashboard/super-admin/manage-academics/courses">
              <Button className="h-auto w-full flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Manage Courses</span>
              </Button>
            </Link>
            <Link href="/dashboard/super-admin/manage-questions/exams">
              <Button className="h-auto w-full flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
                <GraduationCap className="h-6 w-6 mb-2" />
                <span>Create Exam</span>
              </Button>
            </Link>
            <Link href="/dashboard/super-admin/manage-questions/results">
              <Button className="h-auto w-full flex flex-col items-center justify-center py-4 space-y-2" variant="outline">
                <Activity className="h-6 w-6 mb-2" />
                <span>Manage Results</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}