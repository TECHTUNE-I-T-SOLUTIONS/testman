"use client";
import { useEffect, useState, useMemo } from "react";

type Department = { _id: string; name: string; facultyId: string };
type Faculty = { _id: string; name: string };

interface DepartmentListProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
  confirmDeleteId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

export default function DepartmentList({
  departments,
  onEdit,
  onDelete,
  confirmDeleteId,
  onConfirmDelete,
  onCancelDelete,
}: DepartmentListProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaculty, setExpandedFaculty] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaculties() {
      try {
        const res = await fetch("/api/faculties");
        const data = await res.json();
        console.log("Fetched Faculties:", data);
        setFaculties(data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    }
    fetchFaculties();
  }, []);

  const facultyLookup = useMemo(
    () =>
      faculties.reduce(
        (acc, faculty) => ({ ...acc, [faculty._id]: faculty.name }),
        {} as Record<string, string>
      ),
    [faculties]
  );

  const filteredDepartments = useMemo(
    () =>
      departments.filter((dept) =>
        dept.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [departments, searchQuery]
  );

  const departmentsByFaculty = useMemo(() => {
    const grouped: Record<string, Department[]> = {};
    filteredDepartments.forEach((dept) => {
      if (!grouped[dept.facultyId]) {
        grouped[dept.facultyId] = [];
      }
      grouped[dept.facultyId].push(dept);
    });
    return grouped;
  }, [filteredDepartments]);

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Faculties & Departments
      </h2>

      <input
        type="text"
        placeholder="🔍 Search department..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2 mb-4 border text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {faculties.length === 0 ? (
        <p className="text-gray-600">No faculties found.</p>
      ) : (
        <div className="space-y-4">
          {faculties.map((faculty) => (
            <div
              key={faculty._id}
              className="bg-gray-100 p-4 rounded-lg shadow"
            >
              <div
                className="flex justify-between items-center cursor-pointer p-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                onClick={() =>
                  setExpandedFaculty((prev) =>
                    prev === faculty._id ? null : faculty._id
                  )
                }
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {faculty.name}{" "}
                  <span className="text-sm text-gray-600">
                    ({departmentsByFaculty[faculty._id]?.length || 0}{" "}
                    departments)
                  </span>
                </h3>
                <span className="text-gray-600">
                  {expandedFaculty === faculty._id ? "▲" : "▼"}
                </span>
              </div>

              {expandedFaculty === faculty._id && (
                <ul className="mt-3 space-y-3">
                  {departmentsByFaculty[faculty._id]?.length > 0 ? (
                    departmentsByFaculty[faculty._id].map((dept) => (
                      <li
                        key={dept._id}
                        className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition"
                      >
                        <p className="text-gray-900">
                          {dept.name} (
                          {facultyLookup[dept.facultyId] || "Unknown Faculty"})
                        </p>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => onEdit(dept)}
                            className="px-4 py-1 bg-purple-500 text-white rounded-lg"
                          >
                            ✏️ Edit
                          </button>

                          {confirmDeleteId === dept._id ? (
                            <div>
                              <button
                                onClick={() => onConfirmDelete(dept._id)}
                                className="text-red-600 font-medium"
                              >
                                ✅ Confirm
                              </button>
                              <button
                                onClick={onCancelDelete}
                                className="text-gray-600 font-medium ml-2"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => onDelete(dept._id)}
                              className="px-4 py-1 bg-red-500 text-white rounded-lg"
                            >
                              🗑️ Delete
                            </button>
                          )}
                        </div>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-600 p-3">
                      No departments available.
                    </p>
                  )}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
