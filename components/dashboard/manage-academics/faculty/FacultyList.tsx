"use client";

import { useState } from "react";
import { Faculty } from "@/types/types"; 

interface FacultyListProps {
  faculties: Faculty[];
  onEdit: (faculty: Faculty) => void;
  onDelete: (id: string) => void;
}

export default function FacultyList({
  faculties,
  onEdit,
  onDelete,
}: FacultyListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaculties = faculties.filter((faculty) =>
    `${faculty.name} ${faculty.session}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    console.log("Deleting Faculty ID:", id); 

    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Faculties List
      </h2>

      <input
        type="text"
        placeholder="Search by name or session..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border text-gray-900 border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
      />

      {filteredFaculties.length === 0 ? (
        <p className="text-gray-500 text-center">No faculties found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredFaculties.map((faculty) => (
            <li
              key={faculty._id}
              className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200 transition hover:shadow-md"
            >
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {faculty.name}
                </p>
                <p className="text-sm text-gray-600">{faculty.session}</p>
              </div>

              <div className="mt-3 sm:mt-0 flex items-center space-x-3">
                <button
                  onClick={() =>
                    onEdit({
                      ...faculty,
                      departments: faculty.departments || [],
                    })
                  }
                  className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-all"
                  aria-label={`Edit ${faculty.name}`}
                >
                  ✏️ Edit
                </button>

                {confirmDeleteId === faculty._id ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDelete(faculty._id)}
                      className="text-red-600 font-medium hover:text-red-800 transition"
                      aria-label={`Confirm delete ${faculty.name}`}
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="text-gray-500 font-medium hover:text-gray-700 transition"
                      aria-label={`Cancel delete ${faculty.name}`}
                    >
                      ❌ Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDelete(faculty._id)}
                    className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-all"
                    aria-label={`Delete ${faculty.name}`}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
