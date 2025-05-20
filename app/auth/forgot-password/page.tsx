// /auth/forgot-password/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
 
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const sendOtp = async () => {
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toast.success("OTP sent to your email");
        setOtpSent(true);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await fetch(`/api/auth/verify-otp?email=${email}&otp=${otp}`);
      const data = await res.json();

      if (res.ok) {
        toast.success("OTP verified");
        setOtpVerified(true);
      } else {
        toast.error(data.error || "OTP verification failed");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error("An error occurred");
    }
  };

  const resetPassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!strongPasswordRegex.test(newPassword)) {
      toast.error("Password must include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated successfully. You can now log in.");
        // Optionally redirect to login page
      } else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 bg-white shadow-md rounded">
      {!otpSent ? (
        <>
          <h2 className="text-xl text-center font-semibold mb-4">Forgot Password</h2>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-4"
          />
          <Button onClick={sendOtp} className="w-full">
            Send OTP
          </Button>
        </>
      ) : !otpVerified ? (
        <>
          <h2 className="text-xl font-semibold mb-4">Verify OTP</h2>
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="mb-4"
          />
          <Button onClick={verifyOtp} className="w-full">
            Confirm OTP
          </Button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-semibold mb-4">Reset Password</h2>
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mb-4"
          />
          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mb-4"
          />
          <Button onClick={resetPassword} className="w-full">
            Change Password
          </Button>          
        </>
      )}
          <p className="text-sm text-muted-foreground text-center">
            You can go back to login{" "}
            <Link
              href="/auth/login"
              className={cn(
                "inline !p-0 !m-0",
                buttonVariants({ variant: "link" })
              )}
            >
              here
            </Link>
          </p>      
    </div>
  );
}
