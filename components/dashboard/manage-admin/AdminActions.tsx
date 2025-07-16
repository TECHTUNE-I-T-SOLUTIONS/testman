"use client";

import { useState } from "react";

interface Admin {
  _id: string;
  matricNumber: string;
  email: string;
  role: "Admin" | "Sub-Admin";
  assignedFaculty?: string;
  assignedDepartment?: string;
}

interface AdminActionsProps {
  admin: Admin;
  fetchAdmins: () => void;
}

export default function AdminActions({ admin, fetchAdmins }: AdminActionsProps) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    matricNumber: admin.matricNumber,
    email: admin.email,
    role: admin.role,
    assignedFaculty: admin.assignedFaculty || "",
    assignedDepartment: admin.assignedDepartment || "",
  });

  const deleteAdmin = async () => {
    await fetch("/api/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: admin._id }),
    });
    fetchAdmins();
  };

  const updateAdmin = async () => {
    const updated = {
      id: admin._id,
      matricNumber: formData.matricNumber,
      email: formData.email,
      role: formData.role,
      assignedFaculty: formData.role === "Admin" ? formData.assignedFaculty : null,
      assignedDepartment: formData.role === "Sub-Admin" ? formData.assignedDepartment : null,
    };

    const res = await fetch("/api/admins", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });

    if (res.ok) {
      setEditing(false);
      fetchAdmins();
    } else {
      alert("Failed to update admin");
    }
  };

  return (
    <div>
      {editing ? (
        <div className="bg-gray-100 p-2 rounded shadow mt-2 space-y-2">
          <input
            type="text"
            value={formData.matricNumber}
            onChange={(e) => setFormData({ ...formData, matricNumber: e.target.value })}
            placeholder="Matric No"
            className="border px-2 py-1 rounded w-full"
          />
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email"
            className="border px-2 py-1 rounded w-full"
          />
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as "Admin" | "Sub-Admin" })}
            className="border px-2 py-1 rounded w-full"
          >
            <option value="Admin">Admin</option>
            <option value="Sub-Admin">Sub-Admin</option>
          </select>

          {formData.role === "Admin" && (
            <input
              type="text"
              value={formData.assignedFaculty}
              onChange={(e) => setFormData({ ...formData, assignedFaculty: e.target.value })}
              placeholder="Assigned Faculty ID"
              className="border px-2 py-1 rounded w-full"
            />
          )}

          {formData.role === "Sub-Admin" && (
            <input
              type="text"
              value={formData.assignedDepartment}
              onChange={(e) => setFormData({ ...formData, assignedDepartment: e.target.value })}
              placeholder="Assigned Department ID"
              className="border px-2 py-1 rounded w-full"
            />
          )}

          <div className="flex justify-end space-x-2">
            <button
              onClick={updateAdmin}
              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          <button
            onClick={() => setEditing(true)}
            className="bg-purple-500 text-white px-3 py-1 hover:bg-purple-600 rounded"
          >
            Edit
          </button>
          <button
            onClick={deleteAdmin}
            className="bg-red-500 text-white px-3 py-1 hover:bg-red-600 rounded"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
