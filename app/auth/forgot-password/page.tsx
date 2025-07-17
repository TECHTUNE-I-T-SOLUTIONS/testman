
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Shield, 
  CheckCircle2,
  Clock,
  RefreshCw
} from "lucide-react"

export default function ForgotPasswordPage() {
  const [channel, setChannel] = useState<"email" | "email2" | "sms" | "whatsapp">("email")
  const [contact, setContact] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [timer, setTimer] = useState(600)
  const [canResend, setCanResend] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const sendOtp = async () => {
    if (!contact) {
      toast.error(`Please enter your ${channel.includes("email") ? "email" : "phone number"}`)
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          ...(channel.includes("email") ? { email: contact } : { phoneNumber: contact }),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        const now = Date.now()
        const otpTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}")

        otpTimers[channel] = { sentTime: now }
        localStorage.setItem("otpTimers", JSON.stringify(otpTimers))

        toast.success(`OTP sent via ${channel}`)
        setOtpSent(true)
        setTimer(600)
        setCanResend(false)
      } else {
        toast.error(data.error || "Failed to send OTP")
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!otpSent || timer <= 0) return

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdown)
  }, [otpSent, timer])

  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}")
    const otpInfo = storedTimers[channel]

    if (otpInfo && otpInfo.sentTime) {
      const elapsed = Math.floor((Date.now() - otpInfo.sentTime) / 1000)
      const remaining = 600 - elapsed

      if (remaining > 0) {
        setOtpSent(true)
        setTimer(remaining)
        setCanResend(false)
      } else {
        setCanResend(true)
      }
    } else {
      setOtpSent(false)
      setTimer(0)
      setCanResend(false)
    }
  }, [channel])

  const handleResend = async () => {
    await sendOtp()
    setTimer(600)
    setCanResend(false)
  }

  const verifyOtp = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/auth/verify-otp?${channel.includes("email") ? "email" : "phoneNumber"}=${contact}&otp=${otp}`
      )
      const data = await res.json()

      if (res.ok) {
        toast.success("OTP verified")
        setOtpVerified(true)

        const otpTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}")
        delete otpTimers[channel]
        localStorage.setItem("otpTimers", JSON.stringify(otpTimers))
      } else {
        toast.error(data.error || "OTP verification failed")
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
    if (!strongPasswordRegex.test(newPassword)) {
      toast.error("Password must include uppercase, lowercase, number, and special character.")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp,
          newPassword,
          ...(channel.includes("email") ? { email: contact } : { phoneNumber: contact }),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success("Password updated successfully. You can now log in.")
        localStorage.removeItem("otpSentTime")
        localStorage.removeItem("otpChannel")
      } else {
        toast.error(data.error || "Failed to update password")
      }
    } catch (error) {
      console.error("Error updating password:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case "email":
      case "email2":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "whatsapp":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <Mail className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back to Login */}
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {!otpSent 
                ? "Reset Password" 
                : !otpVerified 
                ? "Verify Code" 
                : "Create New Password"
              }
            </CardTitle>
            <CardDescription className="text-gray-600">
              {!otpSent 
                ? "Choose your preferred method to receive a verification code"
                : !otpVerified 
                ? "Enter the verification code sent to your device"
                : "Create a strong new password for your account"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {!otpSent ? (
              <>
                {/* Channel Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "email", label: "Email", description: "Primary email" },
                      { key: "email2", label: "Email 2", description: "Alternative email" },
                      { key: "sms", label: "SMS", description: "Text message" },
                      { key: "whatsapp", label: "WhatsApp", description: "WhatsApp message" }
                    ].map((option) => (
                      <Button
                        key={option.key}
                        variant={channel === option.key ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setChannel(option.key as "email" | "email2" | "sms" | "whatsapp")
                          setContact("")
                          setOtpSent(false)
                          setOtpVerified(false)
                          setTimer(0)
                          setCanResend(false)
                          localStorage.removeItem("otpSentTime")
                          localStorage.removeItem("otpChannel")
                        }}
                        className={cn(
                          "h-auto p-3 flex flex-col items-center gap-1",
                          channel === option.key && "bg-gradient-to-r from-blue-500 to-indigo-600"
                        )}
                      >
                        {getChannelIcon(option.key)}
                        <span className="text-xs font-medium">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Note: SMS service might be temporarily unavailable. Email is recommended.
                  </p>
                </div>

                {/* Contact Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {channel.includes("email") ? "Email Address" : "Phone Number"}
                  </label>
                  <Input
                    type={channel.includes("email") ? "email" : "tel"}
                    placeholder={`Enter your ${channel.includes("email") ? "email address" : "phone number"}`}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button 
                  onClick={sendOtp} 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      {getChannelIcon(channel)}
                      <span className="ml-2">Send Verification Code</span>
                    </>
                  )}
                </Button>
              </>
            ) : !otpVerified ? (
              <>
                {/* OTP Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Verification Code</label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-12 text-center text-lg tracking-widest border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 text-center">
                    Code sent to {channel.includes("email") ? "your email" : "your phone"}
                  </p>
                </div>

                {/* Timer/Resend */}
                <div className="text-center">
                  {!canResend ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>Resend code in {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}</span>
                    </div>
                  ) : (
                    <Button
                      variant="link"
                      onClick={handleResend}
                      className="text-blue-600 hover:text-blue-700"
                      disabled={isLoading}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Resend Code
                    </Button>
                  )}
                </div>

                <Button 
                  onClick={verifyOtp} 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
                  disabled={isLoading || otp.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify Code
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Password Reset */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">New Password</label>
                    <Input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    Password must contain at least 6 characters including uppercase, lowercase, number, and special character.
                  </div>
                </div>

                <Button 
                  onClick={resetPassword} 
                  className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium"
                  disabled={isLoading || newPassword !== confirmPassword || newPassword.length < 6}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </>
            )}

            {/* Footer Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
