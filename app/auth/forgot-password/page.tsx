"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [channel, setChannel] = useState<"email" | "email2" | "sms" | "whatsapp">("email");
  const [contact, setContact] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
	const [timer, setTimer] = useState(600); // 10 minutes in seconds
	const [canResend, setCanResend] = useState(false);

  const sendOtp = async () => {
    if (!contact) {
      toast.error(`Please enter your ${channel.includes("email") ? "email" : "phone number"}`);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          ...(channel.includes("email") ? { email: contact } : { phoneNumber: contact }),
        }),
      });

      const data = await res.json();

			if (res.ok) {
			  const now = Date.now();
			  const otpTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}");

			  otpTimers[channel] = { sentTime: now };
			  localStorage.setItem("otpTimers", JSON.stringify(otpTimers));

			  toast.success(`OTP sent via ${channel}`);
			  setOtpSent(true);
			  setTimer(600); // Reset timer
			  setCanResend(false);
			} else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("An error occurred");
    }
  };

	useEffect(() => {
	  if (!otpSent || timer <= 0) return;

	  const countdown = setInterval(() => {
	    setTimer((prev) => {
	      if (prev <= 1) {
	        clearInterval(countdown);
	        setCanResend(true);
	        return 0;
	      }
	      return prev - 1;
	    });
	  }, 1000);

	  return () => clearInterval(countdown);
	}, [otpSent, timer]);


	useEffect(() => {
	  const storedTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}");
	  const otpInfo = storedTimers[channel];

	  if (otpInfo && otpInfo.sentTime) {
	    const elapsed = Math.floor((Date.now() - otpInfo.sentTime) / 1000);
	    const remaining = 600 - elapsed;

	    if (remaining > 0) {
	      setOtpSent(true);
	      setTimer(remaining);
	      setCanResend(false);
	    } else {
	      setCanResend(true);
	    }
	  } else {
	    setOtpSent(false);
	    setTimer(0);
	    setCanResend(false);
	  }
	}, [channel]);



	const handleResend = async () => {
	  // Call your sendOtp function here
	  await sendOtp();
	  setTimer(600);
	  setCanResend(false);
	};

  const verifyOtp = async () => {
    try {
      const res = await fetch(
        `/api/auth/verify-otp?${channel.includes("email") ? "email" : "phoneNumber"}=${contact}&otp=${otp}`
      );
      const data = await res.json();

			if (res.ok) {
			  toast.success("OTP verified");
			  setOtpVerified(true);

			  const otpTimers = JSON.parse(localStorage.getItem("otpTimers") || "{}");
			  delete otpTimers[channel];
			  localStorage.setItem("otpTimers", JSON.stringify(otpTimers));
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
        body: JSON.stringify({
          otp,
          newPassword,
          ...(channel.includes("email") ? { email: contact } : { phoneNumber: contact }),
        }),
      });

      const data = await res.json();

			if (res.ok) {
			  toast.success("Password updated successfully. You can now log in.");
			  localStorage.removeItem("otpSentTime");
			  localStorage.removeItem("otpChannel");
			} else {
        toast.error(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("An error occurred");
    }
  };

  return (
	<div className="relative max-w-md mx-auto mt-10">
	  {/* Border Pulse Animation */}
	  <div className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-borderPulse z-[-1]" />

	  {/* Inner Content */}
	  <div className="p-4 bg-white shadow-md rounded-lg relative z-10">
	    {!otpSent ? (
	      <>
	        <h2 className="text-xl text-center font-semibold mb-4">Forgot Password</h2>
	        <p className="text-sm m-4 text-muted-foreground text-center mt-4">
	          Select your preferred channel to receive email from below <br/>
	          Please, note that the sms otp might not be available for the time, <br/>
	          kindly make use of the email otp service.
	        </p>
	        <div className="flex gap-2 mb-4 justify-center flex-wrap">
	          {["email", "email2", "sms", "whatsapp"].map((option) => (
							<Button
							  key={option}
							  variant={channel === option ? "default" : "outline"}
							  onClick={() => {
							    setChannel(option as "email" | "email2" | "sms" | "whatsapp");
							    setContact("");
							    setOtpSent(false);
							    setOtpVerified(false);
							    setTimer(0);
							    setCanResend(false);
							    localStorage.removeItem("otpSentTime");
							    localStorage.removeItem("otpChannel");
							  }}
							>
							  {option.toUpperCase()}
							</Button>
	          ))}
	        </div>

	        <Input
	          type={channel.includes("email") ? "email" : "tel"}
	          placeholder={`Enter your ${channel.includes("email") ? "email" : "phone number"}`}
	          value={contact}
	          onChange={(e) => setContact(e.target.value)}
	          className="mb-4"
	        />

					<Button onClick={sendOtp} className="w-full">
					  Send OTP
					</Button>

					{otpSent && (
					  !canResend ? (
					    <p className="text-center mt-2 text-sm text-muted-foreground">
					      Resend code in {Math.floor(timer / 60)}:{('0' + (timer % 60)).slice(-2)}
					    </p>
					  ) : (
					    <button
					      onClick={handleResend}
					      className="text-sm text-blue-500 underline mt-2 mx-auto block"
					    >
					      Resend Code
					    </button>
					  )
					)}

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

	    <p className="text-sm text-muted-foreground text-center mt-4">
	      You can go back to login{" "}
	      <Link
	        href="/auth/login"
	        className={cn("inline !p-0 !m-0", buttonVariants({ variant: "link" }))}
	      >
	        here
	      </Link>
	    </p>
	  </div>
	</div>
  );
}
