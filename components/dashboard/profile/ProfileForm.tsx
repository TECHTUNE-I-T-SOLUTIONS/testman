"use client"

import type React from "react"

import { type SetStateAction, useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { User, Mail, Hash, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

export default function ProfileForm() {
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [originalEmail, setOriginalEmail] = useState("")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email)
      setOriginalEmail(session.user.email)
    }
  }, [session])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error("Email cannot be empty!")
      return
    }
    if (email !== originalEmail) {
      setShowConfirmModal(true)
    } else {
      toast("No changes detected.")
    }
  }

  const confirmEmailChange = async () => {
    setShowConfirmModal(false)
    try {
      const res = await fetch("/api/profile/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success("Email updated. Logging out...")
        setIsLoggingOut(true)
        setTimeout(async () => {
          await signOut({ callbackUrl: "/auth/admin/login" })
        }, 1000)
      } else {
        toast.error(data.error || "Error updating email.")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error("Something went wrong. Please try again.")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Information
          </CardTitle>
          <CardDescription>Update your account information and contact details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setEmail(e.target.value)}
                placeholder="Enter your email address"
              />
            </div>

            {/* Matric Number (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="matricNumber" className="flex items-center gap-2">
                <Hash className="h-4 w-4" />
                Matric Number
              </Label>
              <div className="relative">
                <Input
                  id="matricNumber"
                  type="text"
                  value={session?.user?.matricNumber || ""}
                  disabled
                  className="bg-muted"
                />
                <Badge variant="secondary" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs">
                  Read-only
                </Badge>
              </div>
            </div>

            {/* Role Display */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Role
              </Label>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize bg-primary/10 text-primary border-primary/20">
                  {session?.user?.role || "Admin"}
                </Badge>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingOut}>
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging Out...
                </>
              ) : (
                <>
                  <User className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Confirm Email Change
            </DialogTitle>
            <DialogDescription>
              Changing your email will log you out immediately. You&apos;ll need to sign in again with your new email
              address.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmEmailChange} className="bg-destructive hover:bg-destructive/90">
              Change Email & Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
