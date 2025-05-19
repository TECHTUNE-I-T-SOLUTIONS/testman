"use client";

import { SetStateAction, useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { toast } from "react-hot-toast";
import InputField from "./InputField";
import Button from "../Button";

export default function ProfileForm() {
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
      setOriginalEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email cannot be empty!");
      return;
    }

    if (email !== originalEmail) {
      setShowConfirmModal(true);
    } else {
      toast("No changes detected.");
    }
  };

  const confirmEmailChange = async () => {
    setShowConfirmModal(false);

    try {
      const res = await fetch("/api/profile/update-email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Email updated. Logging out...");
        setIsLoggingOut(true);

        setTimeout(async () => {
          await signOut({ callbackUrl: "/auth/admin/login" });
        }, 1000);
      } else {
        toast.error(data.error || "Error updating email.");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
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
        <Button type="submit" disabled={isLoggingOut}>
          {isLoggingOut ? "Logging Out..." : "Save Changes"}
        </Button>
      </form>
 
      {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-2">Confirm Email Change</h2>
            <p className="text-gray-700 mb-4">
              Changing your email will log you out. Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmEmailChange}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Yes, Change Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
