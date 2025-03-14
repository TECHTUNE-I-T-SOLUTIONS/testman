import { useState, useEffect } from "react";
import { Faculty } from "@/types/types";

interface LevelFormProps {
  onSave: (data: { name: string; departmentId: string }, id?: string) => void;
  faculties?: Faculty[];
  departments: { _id: string; name: string }[];
  fetchDepartments: (facultyId: string) => void;
  editingLevel: {
    _id: string;
    name: string;
    departmentId: string | { _id: string };
  } | null;
}

export default function LevelForm({
  onSave,
  faculties = [],
  departments,
  fetchDepartments,
  editingLevel,
}: LevelFormProps) {
  const [name, setName] = useState(editingLevel?.name || "");
  const [selectedFacultyId, setSelectedFacultyId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    typeof editingLevel?.departmentId === "object"
      ? editingLevel.departmentId._id
      : editingLevel?.departmentId || ""
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (editingLevel && faculties.length > 0) {
      setName(editingLevel.name);

      const departmentId =
        typeof editingLevel.departmentId === "object"
          ? editingLevel.departmentId._id
          : editingLevel.departmentId;
      setSelectedDepartmentId(departmentId);

      const faculty = faculties.find((f) =>
        f.departments.some((d) => d._id === departmentId)
      );
      if (faculty) {
        setSelectedFacultyId(faculty._id);
        fetchDepartments(faculty._id);
      }
    }
  }, [editingLevel, faculties, fetchDepartments]);

  const handleFacultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facultyId = e.target.value;
    setSelectedFacultyId(facultyId);
    setSelectedDepartmentId(""); 

    if (facultyId) {
      fetchDepartments(facultyId); 
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !selectedDepartmentId) {
      setError("Please fill in all fields.");
      return;
    }

    onSave({ name, departmentId: selectedDepartmentId }, editingLevel?._id);

    // Reset form
    setName("");
    setSelectedFacultyId("");
    setSelectedDepartmentId("");
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        {editingLevel ? "Edit Level" : "Add Level"}
      </h2>

      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Level Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full text-gray-900 p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Faculty
        </label>
        <select
          value={selectedFacultyId}
          onChange={handleFacultyChange}
          className="mt-1 block w-full text-gray-900 p-2 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
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

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700">
          Select Department
        </label>
        <select
          value={selectedDepartmentId}
          onChange={(e) => setSelectedDepartmentId(e.target.value)}
          className="mt-1 block w-full p-2 text-gray-900 border border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500"
          required
          disabled={departments.length === 0}
        >
          <option value="">-- Select Department --</option>
          {departments.map((dept) => (
            <option key={dept._id} value={dept._id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-4 w-full bg-indigo-600 text-white font-medium py-2 rounded-lg hover:bg-indigo-700 transition-all"
      >
        {editingLevel ? "Update Level" : "Add Level"}
      </button>
    </form>
  );
}
