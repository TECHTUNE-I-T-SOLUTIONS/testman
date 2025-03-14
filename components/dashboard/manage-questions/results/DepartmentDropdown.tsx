"use client";

import { useEffect, useState } from "react";

interface Department {
  _id: string;
  name: string;
}

interface Props {
  onChange: (id: string) => void;
}

export default function DepartmentDropdown({ onChange }: Props) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(() => console.error("Failed to fetch departments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full">
      <label className="block text-gray-700 font-medium mb-1">
        🎓 Select Department:
      </label>
      <select
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-purple-500 rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
      >
        <option value="">📍 Choose a department</option>
        {loading ? (
          <option disabled>⏳ Loading...</option>
        ) : (
          departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))
        )}
      </select>
    </div>
  );
}
