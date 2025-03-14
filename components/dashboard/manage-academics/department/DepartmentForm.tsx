"use client";

import { useState, useEffect } from "react";
import { Faculty, Department, DepartmentInput } from "@/types/types";

interface DepartmentFormProps {
  onSave: (data: DepartmentInput) => void;
  editingDepartment: Department | null;
  faculties: Faculty[];
}

export default function DepartmentForm({
  onSave,
  editingDepartment,
  faculties,
}: DepartmentFormProps) {
  const [name, setName] = useState(editingDepartment?.name || "");
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    editingDepartment?.facultyId || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingDepartment) {
      setName(editingDepartment.name);
      setSelectedFacultyId(editingDepartment.facultyId);
    }
  }, [editingDepartment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !selectedFacultyId) {
      setError("All fields are required.");
      return;
    }

    console.log("Submitting Department:", {
      name,
      facultyId: selectedFacultyId,
    });

    onSave({ name, facultyId: selectedFacultyId });

    setName("");
    setSelectedFacultyId("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {editingDepartment ? "Edit Department" : "Add Department"}
      </h2>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Department Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter department name"
          className="mt-1 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Faculty Dropdown */}
      <div className="mt-4">
        <label
          htmlFor="faculty"
          className="block text-sm font-medium text-gray-700"
        >
          Select Faculty
        </label>
        <select
          id="faculty"
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          className="mt-1 block w-full p-2 border text-gray-900 border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">-- Select Faculty --</option>
          {faculties.map((faculty) => (
            <option key={faculty._id} value={faculty._id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-all"
      >
        {editingDepartment ? "Update Department" : "Add Department"}
      </button>
    </form>
  );
}
