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
  const [deleting, setDeleting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);

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
      toast.success(`Exam ${!isActive ? "Published" : "Unpublished"} successfully!`);
    } catch (error) {
      console.error("Error updating exam status:", error);
      toast.error("Error updating status");
    } finally {
      setLoading(false);
    }
  };

  const deleteExam = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/exams/${exam._id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete exam");

      toast.success("Exam deleted successfully.");
      setShowModal(false);
      // Optional: Refresh or update parent component state
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
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

        <button
          onClick={() => setShowModal(true)}
          disabled={deleting}
          className="px-4 py-2 rounded-md bg-black text-white hover:bg-gray-800 transition duration-300 shadow-md disabled:opacity-50"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-lg max-w-sm w-full p-6">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="mb-6 text-sm text-gray-700">
              Are you sure you want to permanently delete the exam "
              <span className="font-bold">{exam.title}</span>"?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-black rounded-md hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={deleteExam}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
