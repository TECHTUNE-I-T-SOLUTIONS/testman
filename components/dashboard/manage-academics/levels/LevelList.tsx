"use client";

import { useState, useMemo, useEffect } from "react";
import { Department } from "@/types/types";

interface LevelListProps {
  levels: Level[];
  departments: Department[];
  onDelete: (id: string) => void;
}
interface Level {
  _id: string;
  name: string;
  courses?: string[];
  departmentId: string | { _id: string };
}


export default function LevelList({
  levels,
  departments,
  onDelete,
}: LevelListProps) {
  const [expandedDepartment, setExpandedDepartment] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetched Levels:", levels);
    console.log("Fetched Departments:", departments);
  }, [levels, departments]);


  const departmentLookup = useMemo(() => {
    return departments.reduce(
      (acc, department) => {
        acc[department._id] = department.name;
        return acc;
      },
      {} as Record<string, string>
    );
  }, [departments]);

  const getDepartmentName = (departmentId: string) => {
    return departmentLookup[departmentId] || "Unknown Department";
  };

  // Group levels by department
  const levelsByDepartment = useMemo(() => {
    if (!Array.isArray(levels) || !Array.isArray(departments)) {
      return {};
    }

    const validDepartmentIds = new Set(departments.map((d) => d._id));
    const grouped: Record<string, Level[]> = {};

    levels.forEach((level) => {
      const deptId =
        typeof level.departmentId === "object"
          ? level.departmentId._id
          : level.departmentId;

      if (validDepartmentIds.has(deptId)) {
        if (!grouped[deptId]) {
          grouped[deptId] = [];
        }
        grouped[deptId].push(level);
      } else {
        console.warn(
          `Level ${level._id} has an invalid department ID: ${deptId}`
        );
      }
    });

    return grouped;
  }, [levels, departments]);

  return (
    <div className="mt-6 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Levels by Department
      </h2>

      {Object.keys(levelsByDepartment).length === 0 ? (
        <p className="text-gray-500">No levels added yet.</p>
      ) : (
        <div className="space-y-4">
          {Object.entries(levelsByDepartment).map(
            ([departmentId, departmentLevels]) => (
              <div
                key={departmentId}
                className="bg-gray-50 p-4 rounded-lg shadow-md"
              >
                <div
                  className="flex justify-between items-center cursor-pointer p-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
                  onClick={() =>
                    setExpandedDepartment((prev) =>
                      prev === departmentId ? null : departmentId
                    )
                  }
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getDepartmentName(departmentId)}{" "}
                    <span className="text-sm text-gray-600">
                      ({departmentLevels.length} levels)
                    </span>
                  </h3>

                  <span className="text-gray-600">
                    {expandedDepartment === departmentId ? "▲" : "▼"}
                  </span>
                </div>

                {expandedDepartment === departmentId && (
                  <ul className="mt-3 space-y-3">
                    {departmentLevels.map((level) => (
                      <li
                        key={level._id}
                        className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center hover:shadow-md transition"
                      >
                        <p className="font-bold text-gray-900">{level.name}</p>
                        <div className="space-x-2">
                          {confirmDeleteId === level._id ? (
                            <div>
                              <button
                                onClick={() => {
                                  onDelete(level._id);
                                  setConfirmDeleteId(null);
                                }}
                                className="text-red-600 font-medium"
                              >
                                ✅ Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-gray-600 font-medium ml-2"
                              >
                                ❌ Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteId(level._id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600 transition"
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
            )
          )}
        </div>
      )}
    </div>
  );
}
