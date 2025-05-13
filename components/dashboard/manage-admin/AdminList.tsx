"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import AdminActions from "./AdminActions";

interface Admin {
  _id: string;
  matricNumber: string;
  email: string;
  role: "Admin" | "Sub-Admin";
  assignedFaculty?: string;
  assignedDepartment?: string;
}

interface Faculty {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
}

interface AdminListProps {
  admins: Admin[];
  fetchAdmins: () => void;
}

export default function AdminList({ admins, fetchAdmins }: AdminListProps) {
  const { data: session, status } = useSession();
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const currentRole = session?.user?.role; // 👈 Extract logged-in admin role

  useEffect(() => {
    async function fetchData() {
      try {
        const [facultyRes, departmentRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
        ]);

        if (!facultyRes.ok || !departmentRes.ok)
          throw new Error("Failed to fetch data");

        const facultyData = await facultyRes.json();
        const departmentData = await departmentRes.json();

        setFaculties(facultyData);
        setDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching faculty/department data:", error);
      }
    }

    fetchData();
  }, []);

  // Helper functions
  const getFacultyName = (facultyId?: string) =>
    faculties.find((faculty) => faculty._id === facultyId)?.name || "N/A";

  const getDepartmentName = (departmentId?: string) =>
    departments.find((department) => department._id === departmentId)?.name || "N/A";

  // ⛔ Wait for session to load
  if (status === "loading") {
    return <p className="text-center text-gray-500">Loading...</p>;
  }

  // 🔐 Filter admins based on logged-in role
  const visibleAdmins =
    currentRole === "Admin"
      ? admins.filter((admin) => admin.role === "Sub-Admin")
      : admins; // Super-admin sees all

  if (visibleAdmins.length === 0) {
    return <p className="text-center text-gray-500">No admins found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-lg rounded-lg border border-purple-300 p-4">
      <h2 className="text-2xl font-bold text-purple-700 mb-4 text-center">
        📋 Admin List
      </h2>

      <table className="w-full border border-purple-300 rounded-lg">
        <thead>
          <tr className="bg-purple-100 text-purple-700">
            <th className="p-3 border border-purple-300 text-left">
              Matric No.
            </th>
            <th className="p-3 border border-purple-300 text-left">Email</th>
            <th className="p-3 border border-purple-300 text-left">Role</th>
            <th className="p-3 border border-purple-300 text-left">Assigned</th>
            <th className="p-3 border border-purple-300 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleAdmins.map((admin, index) => (
            <tr
              key={admin._id}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="p-3 border text-purple-500 border-purple-200">
                {admin.matricNumber}
              </td>
              <td className="p-3 border text-purple-500 border-purple-200">
                {admin.email}
              </td>
              <td className="p-3 border text-purple-500 border-purple-200 font-semibold">
                {admin.role}
              </td>
              <td className="p-3 border text-purple-500 border-purple-200">
                {admin.role === "Admin"
                  ? getFacultyName(admin.assignedFaculty)
                  : getDepartmentName(admin.assignedDepartment)}
              </td>
              <td className="p-3 border border-purple-200">
                <AdminActions admin={admin} fetchAdmins={fetchAdmins} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
