import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type Faculty = { _id: string; name: string };
type Department = { _id: string; name: string };
type Level = { _id: string; name: string };

type Course = {
  _id?: string;
  name: string;
  code: string;
  facultyId: string;
  departmentId: { _id: string; name: string };
  levelId: { _id: string; name: string };
};

type Props = {
  onSubmit: (data: Course | Omit<Course, "_id">) => Promise<void>;
  initialData?: Course;
};

export default function CourseForm({ onSubmit, initialData }: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [code, setCode] = useState(initialData?.code || "");
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    initialData?.facultyId || ""
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    initialData?.departmentId._id || ""
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    initialData?.levelId._id || ""
  );

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  useEffect(() => {
    fetch("/api/faculties")
      .then((res) => res.json())
      .then(setFaculties)
      .catch(() => toast.error("Error fetching faculties."));
  }, []);

  useEffect(() => {
    if (selectedFacultyId) {
      setLoadingDepartments(true);
      fetch(`/api/departments?facultyId=${selectedFacultyId}`)
        .then((res) => res.json())
        .then(setDepartments)
        .catch(() => toast.error("Error fetching departments."))
        .finally(() => setLoadingDepartments(false));
    } else {
      setDepartments([]);
      setSelectedDepartmentId("");
      setLevels([]);
      setSelectedLevelId("");
    }
  }, [selectedFacultyId]);

  useEffect(() => {
    if (selectedDepartmentId) {
      setLoadingLevels(true);
      fetch(`/api/levels?departmentId=${selectedDepartmentId}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.levels)) {
            setLevels(data.levels);
          } else {
            setLevels([]);
          }
        })
        .catch(() => toast.error("Error fetching levels."))
        .finally(() => setLoadingLevels(false));
    } else {
      setLevels([]);
      setSelectedLevelId("");
    }
  }, [selectedDepartmentId]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    try {
      const department = departments.find(
        (d) => d._id === selectedDepartmentId
      );
      const level = levels.find((l) => l._id === selectedLevelId);

      if (!department || !level) {
        toast.error("Invalid department or level selection.");
        return;
      }

      await onSubmit({
        name,
        code,
        facultyId: selectedFacultyId,
        departmentId: { _id: selectedDepartmentId, name: department.name },
        levelId: { _id: selectedLevelId, name: level.name },
      });

      toast.success(
        initialData
          ? "Course updated successfully!"
          : "Course added successfully!"
      );

      setName("");
      setCode("");
      setSelectedFacultyId("");
      setSelectedDepartmentId("");
      setSelectedLevelId("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 shadow-md rounded-lg border border-gray-200"
    >
      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Course Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 text-gray-900 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter course name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Course Code
        </label>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full border border-gray-300 text-gray-900 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter course code"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Faculty
        </label>
        <select
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          className="w-full border border-gray-300 text-gray-900 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="">Select Faculty</option>
          {faculties.map((faculty) => (
            <option key={faculty._id} value={faculty._id}>
              {faculty.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Department
        </label>
        <select
          value={selectedDepartmentId}
          onChange={(e) => setSelectedDepartmentId(e.target.value)}
          className="w-full border border-gray-300 text-gray-900 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={!selectedFacultyId}
        >
          <option value="">Select Department</option>
          {loadingDepartments ? (
            <option>Loading...</option>
          ) : (
            departments.map((dept) => (
              <option key={dept._id} value={dept._id}>
                {dept.name}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700">
          Level
        </label>
        <select
          value={selectedLevelId}
          onChange={(e) => setSelectedLevelId(e.target.value)}
          className="w-full border border-gray-300 text-gray-900 rounded-md p-2 mt-1 focus:ring-blue-500 focus:border-blue-500"
          required
          disabled={!selectedDepartmentId}
        >
          <option value="">Select Level</option>
          {loadingLevels ? (
            <option>Loading...</option>
          ) : (
            levels.map((level) => (
              <option key={level._id} value={level._id}>
                {level.name}
              </option>
            ))
          )}
        </select>
      </div>

      <button
        type="submit"
        className={`w-full bg-purple-600 text-white font-semibold px-4 py-2 rounded-md 
          hover:bg-purple-700 transition-all ${loadingSubmit ? "opacity-50 cursor-not-allowed" : ""}`}
        disabled={loadingSubmit}
      >
        {loadingSubmit
          ? "Submitting..."
          : initialData
            ? "Update Course"
            : "Add Course"}
      </button>
    </form>
  );
}
