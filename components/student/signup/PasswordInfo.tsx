"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import useFormStore from "@/lib/store/useStudentFormStore"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

const PasswordInfoForm = () => {
  const { formData, resetForm, setStep } = useFormStore()
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState({
    password: "",
    confirm_password: "",
  })
  const [errors, setErrors] = useState({
    password: "",
    confirm_password: "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const passwordRequirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "One uppercase letter" },
    { regex: /[a-z]/, text: "One lowercase letter" },
    { regex: /[0-9]/, text: "One number" },
    { regex: /[!@#$%^&*]/, text: "One special character" },
  ]

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Must be at least 8 characters."
    if (!/[A-Z]/.test(password)) return "Must contain an uppercase letter."
    if (!/[a-z]/.test(password)) return "Must contain a lowercase letter."
    if (!/[0-9]/.test(password)) return "Must contain a number."
    if (!/[!@#$%^&*]/.test(password)) return "Must contain a special character."
    return ""
  }

  const handlePasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      password: validatePassword(password.password),
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword((prev) => ({ ...prev, password: e.target.value.trim() }))
  }

  const handleConfirmPasswordBlur = () => {
    setErrors((prev) => ({
      ...prev,
      confirm_password: password.confirm_password !== password.password ? "Passwords do not match." : "",
    }))
  }

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword((prev) => ({ ...prev, confirm_password: e.target.value.trim() }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const passwordError = validatePassword(password.password)
    const confirmPasswordError = password.confirm_password !== password.password ? "Passwords do not match." : ""

    if (passwordError || confirmPasswordError) {
      setErrors({ password: passwordError, confirm_password: confirmPasswordError })
      setLoading(false)
      return
    }

    const updatedFormData = {
      ...formData,
      password: password.password,
      confirmPassword: password.confirm_password,
      status: "Inactive",
      loggedIn: "False",
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFormData),
      })

      if (response.ok) {
        toast.success("Registration Successful!")
        router.push("/auth/login")
        resetForm()
      } else {
        const data = await response.json()
        toast.error(data.message || "Registration failed. Try again.")
      }
    } catch (error) {
      console.log(error)
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <CardHeader className="space-y-4 pb-8">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Create Password</CardTitle>
          <CardDescription className="text-slate-600">Choose a strong password to secure your account</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Account Status:</strong> Your account will be inactive after registration. Contact admin or purchase
            premium access to activate.
          </p>
        </div>

        <div className="grid gap-5">
          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password.password}
                onChange={handlePasswordChange}
                onBlur={handlePasswordBlur}
                placeholder="Create a strong password"
                required
                autoComplete="new-password"
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

            {/* Password Requirements */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-600">Password must contain:</p>
              <div className="grid grid-cols-1 gap-1">
                {passwordRequirements.map((req, index) => {
                  const isValid = req.regex.test(password.password)
                  return (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {isValid ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <XCircle className="w-3 h-3 text-slate-300" />
                      )}
                      <span className={isValid ? "text-green-600" : "text-slate-500"}>{req.text}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {errors.password && (
              <p className="text-red-600 text-sm" aria-live="polite">
                {errors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm_password" className="text-sm font-medium text-slate-700">
              Confirm Password
            </Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? "text" : "password"}
              value={password.confirm_password}
              onChange={handleConfirmPasswordChange}
              onBlur={handleConfirmPasswordBlur}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
            />
            {errors.confirm_password && (
              <p className="text-red-600 text-sm" aria-live="polite">
                {errors.confirm_password}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(2)}
            className="h-11 px-8 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default PasswordInfoForm
