"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

export default function Login() {
  const [formData, setFormData] = useState({
    matricNumber: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      setLoading(false)

      if (response.ok) {
        toast.success("Login Successful!")
        setTimeout(() => {
          router.push("/student")
        }, 2000)
      } else {
        toast.error(data.message || "Login failed. Please try again.")
      }
    } catch (error) {
      console.error("Error during login attempt:", error)
      toast.error("An error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 relative">
      {/* Professional Back Button - Top Left */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="space-y-4 pb-8">
          <div className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Welcome Back</CardTitle>
            <CardDescription className="text-slate-600 text-base">
              Sign in to access your CGPA dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="matricNumber" className="text-sm font-medium text-slate-700">
                Matric Number
              </Label>
              <Input
                id="matricNumber"
                name="matricNumber"
                type="text"
                placeholder="Enter your matric number"
                required
                onChange={handleChange}
                autoComplete="username"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                Email Address
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email address"
                required
                onChange={handleChange}
                autoComplete="email"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  onChange={handleChange}
                  autoComplete="current-password"
                  className="h-11 pr-12 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-slate-600 hover:text-slate-900 hover:underline transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors mt-8"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-6">
          <div className="w-full text-center">
            <p className="text-sm text-slate-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-slate-900 hover:text-slate-700 hover:underline transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </main>
  )
}
