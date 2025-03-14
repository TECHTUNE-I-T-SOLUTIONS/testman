"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Exam {
  _id: string;
  title: string;
  isActive: boolean;
}

interface ToggleExamStatusProps {
  exam: Exam;
}

export default function ToggleExamStatus({ exam }: ToggleExamStatusProps) {
  const [isActive, setIsActive] = useState<boolean>(exam.isActive);
  const [loading, setLoading] = useState<boolean>(false);

  const toggleStatus = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/exams/${exam._id}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (!response.ok) throw new Error("Failed to update exam status");

      setIsActive((prev) => !prev);
      toast.success(
        `Exam ${!isActive ? "Published" : "Unpublished"} successfully!`
      );
    } catch (error) {
      console.error("Error updating exam status:", error);
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggleStatus}
      disabled={loading}
      aria-label={isActive ? "Unpublish Exam" : "Publish Exam"}
      className={`px-4 py-2 rounded-md font-semibold text-white transition duration-300 shadow-md ${
        isActive
          ? "bg-red-600 hover:bg-red-700"
          : "bg-purple-600 hover:bg-purple-700"
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? "⏳ Updating..." : isActive ? "Unpublish" : "Publish"}
    </button>
  );
}
