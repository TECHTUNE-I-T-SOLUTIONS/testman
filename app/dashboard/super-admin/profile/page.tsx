"use client"

import { useSession } from "next-auth/react"
import { User, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import ProfileForm from "@/components/dashboard/profile/ProfileForm"
import PasswordForm from "@/components/dashboard/profile/PasswordForm"

export default function ProfilePage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="space-y-6 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
          <a href="/auth/admin/login">Return to Login</a>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <User className="h-8 w-8 text-primary" />
            Profile Settings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your account information and security settings</p>
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Profile Information */}
        <div>
          <ProfileForm />
        </div>

        {/* Password Settings */}
        <div>
          <PasswordForm />
        </div>
      </div>
    </div>
  )
}
