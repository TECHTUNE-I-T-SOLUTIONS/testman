"use client";

import { useState, useEffect, SetStateAction } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/dashboard/Button";
import InputField from "@/components/dashboard/InputField";
import Header from "@/components/dashboard/Header";

interface AcademicSession {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AcademicSessionsPage() {
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSessions(data);
    } catch (error) {
        console.error("Error fetching session status:", error); 
      toast.error("Error fecthing session");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      toast.error("All fields are required!");
      return;
    }

    try {
      const res = await fetch("/api/session", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, startDate, endDate }),
      });

      if (res.ok) {
        toast.success(editingId ? "Session updated!" : "Session created!");
        setName("");
        setStartDate("");
        setEndDate("");
        setEditingId(null);
        fetchSessions();
      } else {
        const data = await res.json();
        toast.error(data.error || "Error saving session.");
      }
    } catch (error) {
        console.error("Smothing went wrong status:", error); 
      toast.error("Something went wrong.");
    }
  };

  const handleEdit = (session: AcademicSession) => {
    setEditingId(session._id);
    setName(session.name);
    setStartDate(session.startDate.split("T")[0]);
    setEndDate(session.endDate.split("T")[0]);
  };

  const handleDeleteConfirmation = (id: string) => {
    setConfirmDeleteId(id);
  };

  const handleDeleteCancel = () => {
    setConfirmDeleteId(null);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch("/api/session", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success("Session deleted!");
        fetchSessions();
      } else {
        toast.error("Error deleting session.");
      }
    } catch (error) {
        console.error("Error deleting session status:", error); 
      toast.error("Delete error:");
    }

    setConfirmDeleteId(null);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-lg">
      <Header title="Manage Academic Sessions" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Session Name"
          value={name}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setName(e.target.value)
          }
        />
        <InputField
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setStartDate(e.target.value)
          }
        />
        <InputField
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e: { target: { value: SetStateAction<string> } }) =>
            setEndDate(e.target.value)
          }
        />

        <Button type="submit">
          {editingId ? "Update Session" : "Create Session"}
        </Button>
      </form>

      <ul className="mt-6 space-y-4">
        {sessions.map((session) => {
          const formattedStartDate = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(session.startDate));

          const formattedEndDate = new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }).format(new Date(session.endDate));

          return (
            <li
              key={session._id}
              className="p-5 bg-white shadow-md border border-gray-200 rounded-lg flex flex-wrap justify-between items-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex flex-col">
                <p className="text-lg font-semibold text-gray-900">
                  {session.name}
                </p>
                <p className="text-sm text-gray-600">
                  📅 {formattedStartDate} → {formattedEndDate}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleEdit(session)}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-all"
                >
                  ✏️ Edit
                </button>

                {confirmDeleteId === session._id ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="text-red-600 font-medium"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={handleDeleteCancel}
                      className="text-gray-600 font-medium"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteConfirmation(session._id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
