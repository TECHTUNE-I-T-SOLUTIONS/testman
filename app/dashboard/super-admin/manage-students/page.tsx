"use client";

import { useState, useEffect } from "react";
import DropdownFilter from "@/components/dashboard/manage-students/DropdownFilter";
import StudentTable from "@/components/dashboard/manage-students/StudentTable";
import Header from "@/components/dashboard/Header";

// Updated Student Type
export type Student = {
  _id: string;
  name: string;
  email: string;
  matricNumber: string;
  faculty: { _id: string; name: string };
  department: { _id: string; name: string };
  level: { _id: string; name: string }; 
  isActive: boolean;
};

export default function ManageStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const [facultyFilter, setFacultyFilter] = useState<string>("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [levelFilter, setLevelFilter] = useState<string>("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/students");
        const data: Student[] = await res.json();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (facultyFilter) {
      filtered = filtered.filter(
        (student) => student.faculty.name === facultyFilter
      );
    }

    if (departmentFilter) {
      filtered = filtered.filter(
        (student) => student.department.name === departmentFilter
      );
    }

    if (levelFilter) {
      filtered = filtered.filter(
        (student) => student.level.name === levelFilter
      );
    }

    setFilteredStudents(filtered);
  }, [facultyFilter, departmentFilter, levelFilter, students]);

  const handleActivate = async (id: string) => {
    try {
      await fetch("/api/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: true }),
      });

      setStudents((prev) =>
        prev.map((student) =>
          student._id === id ? { ...student, isActive: true } : student
        )
      );
    } catch (error) {
      console.error("Failed to activate student:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      setStudents((prev) => prev.filter((student) => student._id !== id));
    } catch (error) {
      console.error("Failed to delete student:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  const faculties = Array.from(
    new Set(students.map((student) => student.faculty?.name))
  ).filter(Boolean); 

  const departments = Array.from(
    new Set(students.map((student) => student.department?.name))
  ).filter(Boolean);

  const levels = Array.from(
    new Set(students.map((student) => student.level?.name))
  ).filter(Boolean);

  return (
    <div className="p-6 bg-purple-50 rounded-lg shadow-md">
      <Header title="Manage Students" />

      <div className="flex flex-wrap gap-6 mb-6">
        <DropdownFilter
          label="Faculties"
          options={faculties}
          value={facultyFilter}
          onChange={setFacultyFilter}
        />
        <DropdownFilter
          label="Departments"
          options={departments}
          value={departmentFilter}
          onChange={setDepartmentFilter}
        />
        <DropdownFilter
          label="Levels"
          options={levels}
          value={levelFilter}
          onChange={setLevelFilter}
        />
      </div>

      <StudentTable
        students={filteredStudents}
        onActivate={handleActivate}
        onDelete={handleDelete}
      />
    </div>
  );
}
