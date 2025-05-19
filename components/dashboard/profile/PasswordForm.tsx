"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import InputField from "./InputField";
import Button from "../Button";
import { signOut } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react"; // or any icon library you're using

export default function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordLabel, setPasswordLabel] = useState("");

  const evaluatePasswordStrength = (password: string) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[\W_]/.test(password)) score++;

    setPasswordStrength(score);

    if (score <= 2) setPasswordLabel("Weak");
    else if (score === 3 || score === 4) setPasswordLabel("Medium");
    else if (score === 5) setPasswordLabel("Strong");
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      toast.error(
        "Password must be at least 6 characters, include uppercase, lowercase, number, and symbol."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/profile/update-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Password updated! Logging out...");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");

        setTimeout(async () => {
          await signOut({ callbackUrl: "/auth/admin/login" });
        }, 1200);
      } else {
        toast.error(data.error || "Error updating password");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setShowConfirmModal(true);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-8 rounded-lg shadow-lg"
      >
        <h2 className="text-lg font-semibold text-gray-700">Change Password</h2>

        {/* Current Password */}
        <div className="relative">
          <InputField
            label="Current Password"
            type={showOld ? "text" : "password"}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowOld(!showOld)}
            className="absolute top-9 right-4 text-gray-600"
          >
            {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* New Password */}
        <div className="relative">
          <InputField
            label="New Password"
            type={showNew ? "text" : "password"}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              evaluatePasswordStrength(e.target.value);
            }}
          />

          {newPassword && (
            <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all`}
                  style={{
                    width: `${(passwordStrength / 5) * 100}%`,
                    backgroundColor:
                      passwordStrength <= 2
                        ? "red"
                        : passwordStrength <= 4
                        ? "orange"
                        : "green",
                  }}
                ></div>
              </div>
              <p
                className={`text-sm mt-1 ${
                  passwordStrength <= 2
                    ? "text-red-600"
                    : passwordStrength <= 4
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                Strength: {passwordLabel}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute top-9 right-4 text-gray-600"
          >
            {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <InputField
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute top-9 right-4 text-gray-600"
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>

      {/* Custom Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Confirm Password Change
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Changing your password will log you out immediately. Do you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  handlePasswordUpdate();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Update & Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
