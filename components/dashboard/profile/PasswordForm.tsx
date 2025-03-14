"use client";

import { SetStateAction, useState } from "react";
import { toast } from "react-hot-toast"; 
import InputField from "./InputField";
import Button from "../Button";

export default function PasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match! ");
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
        toast.success("Password updated successfully! ");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Error updating password ");
      }
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handlePasswordUpdate}
      className="space-y-4 bg-white p-8 rounded-lg shadow-lg"
    >
      <h2 className="text-lg font-semibold text-gray-700">Change Password</h2>

      <InputField
        label="Current Password"
        type="password"
        value={oldPassword}
        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setOldPassword(e.target.value)}
      />
      <InputField
        label="New Password"
        type="password"
        value={newPassword}
        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setNewPassword(e.target.value)}
      />
      <InputField
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e: { target: { value: SetStateAction<string>; }; }) => setConfirmPassword(e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Password"}
      </Button>
    </form>
  );
}
