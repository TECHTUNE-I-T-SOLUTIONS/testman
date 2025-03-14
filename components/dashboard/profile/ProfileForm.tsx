"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast"; 
import InputField from "./InputField";
import Button from "../Button";

export default function ProfileForm() {
  const { data: session, update } = useSession();
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email cannot be empty! ");
      return;
    }

    try {
      const res = await fetch("/api/profile/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Profile updated successfully! ");
        await update();
      } else {
        toast.error(data.error || "Error updating profile ");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-8 rounded-lg shadow-lg"
    >
      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={(e: { target: { value: SetStateAction<string> } }) =>
          setEmail(e.target.value)
        }
      />
      <InputField
        label="Matric Number"
        type="text"
        value={session?.user?.matricNumber || ""}
        disabled
      />

      <Button type="submit">Save Changes</Button>
    </form>
  );
}
