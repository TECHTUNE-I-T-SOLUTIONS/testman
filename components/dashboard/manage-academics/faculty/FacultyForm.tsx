"use client";

import { useEffect, useState } from "react";

type FacultyInput = { name: string; session: string };
type Faculty = { id: string; name: string; session: string };

interface FacultyFormProps {
  onSave: (data: FacultyInput) => void;
  onCancel?: () => void;
  editingFaculty: Faculty | null;
}

export default function FacultyForm({
  onSave,
  onCancel,
  editingFaculty,
}: FacultyFormProps) {
  const [name, setName] = useState(editingFaculty?.name || "");
  const [session, setSession] = useState(editingFaculty?.session || "");
  const [sessions, setSessions] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        console.log("Fetched sessions:", data);
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.error("Unexpected API response format:", data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    }

    fetchSessions();
  }, []);

  useEffect(() => {
    if (editingFaculty) {
      console.log("Editing Faculty Prop:", editingFaculty); // Debugging
      setName(editingFaculty.name);
      setSession(editingFaculty.session);
    } else {
      setName("");
      setSession("");
    }
  }, [editingFaculty]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, session });

    // Reset form fields only if not in editing mode
    if (!editingFaculty) {
      setName("");
      setSession("");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {editingFaculty ? "Edit Faculty" : "Add New Faculty"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Faculty Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border text-gray-900 border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {/* Dropdown for Academic Session */}
        <div>
          <label
            htmlFor="session"
            className="block text-sm font-medium text-gray-700"
          >
            Academic Session
          </label>
          <select
            id="session"
            value={session}
            onChange={(e) => setSession(e.target.value)}
            className="mt-1 w-full rounded-lg border text-gray-900 border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          >
            <option value="" disabled>
              Select a session
            </option>
            {sessions.length > 0 ? (
              sessions.map((s) => (
                <option key={s._id} value={s.name}>
                  {s.name}
                </option>
              ))
            ) : (
              <option disabled>Loading sessions...</option>
            )}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition-all"
          >
            {editingFaculty ? "Update Faculty" : "Add Faculty"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 font-semibold hover:bg-gray-400 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
