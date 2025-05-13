"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

interface AdminFormProps {
  fetchAdmins: () => void;
}

interface AdminFormData {
  matricNumber: string;
  email: string;
  password: string;
  role: "Admin" | "Sub-Admin";
  assignedFaculty?: string;
  assignedDepartment?: string;
}

export default function AdminForm({ fetchAdmins }: AdminFormProps) {
  const { data: session, status } = useSession();
  const currentUserRole = session?.user?.role;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AdminFormData>({
    defaultValues: { role: "Admin" },
  });

  const role = watch("role");
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [facultyRes, departmentRes] = await Promise.all([
          fetch("/api/faculties"),
          fetch("/api/departments"),
        ]);

        if (!facultyRes.ok || !departmentRes.ok) throw new Error("Failed to fetch data");

        const facultyData = await facultyRes.json();
        const departmentData = await departmentRes.json();

        setFaculties(facultyData);
        setDepartments(departmentData);
      } catch (error) {
        console.error("Error fetching faculties or departments", error);
        toast.error("Error fetching faculties or departments");
      }
    }

    fetchData();
  }, []);

  // Reset assigned fields when role changes
  useEffect(() => {
    setValue("assignedFaculty", undefined);
    setValue("assignedDepartment", undefined);
  }, [role, setValue]);

  // Force role to "Sub-Admin" if current user is Admin
  useEffect(() => {
    if (currentUserRole === "Admin") {
      setValue("role", "Sub-Admin");
    }
  }, [currentUserRole, setValue]);

  const onSubmit = async (data: AdminFormData) => {
    try {
      setLoading(true);
      const response = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to create admin");

      toast.success("Admin created successfully!");
      fetchAdmins();
      reset();
    } catch (error) {
      console.error("Error creating admin", error);
      toast.error("Error creating admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg border border-purple-300">
      <h2 className="text-2xl font-bold text-purple-700 mb-6 text-center">
        ➕ Create Admin
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Matric Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Matric Number</label>
          <input
            {...register("matricNumber", { required: "Matric number is required" })}
            placeholder="Enter Matric Number"
            className="w-full p-3 border text-gray-900 border-purple-300 rounded focus:ring focus:ring-purple-200"
          />
          {errors.matricNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.matricNumber.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register("email", { required: "Email is required" })}
            type="email"
            placeholder="Enter Email"
            className="w-full p-3 border text-gray-900 border-purple-300 rounded focus:ring focus:ring-purple-200"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            {...register("password", { required: "Password is required" })}
            type="password"
            placeholder="Enter Password"
            className="w-full p-3 border text-gray-900 border-purple-300 rounded focus:ring focus:ring-purple-200"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            {...register("role")}
            className="w-full p-3 text-gray-900 border border-purple-300 rounded bg-white focus:ring focus:ring-purple-200"
            disabled={currentUserRole === "Admin"} // prevent changing role
          >
            {currentUserRole === "super-admin" ? (
              <>
                <option value="Admin">Admin</option>
                <option value="Sub-Admin">Sub-Admin</option>
              </>
            ) : (
              <option value="Sub-Admin">Sub-Admin</option>
            )}
          </select>
        </div>

        {/* Conditional Faculty or Department */}
        {role === "Admin" && currentUserRole === "super-admin" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Faculty</label>
            <select
              {...register("assignedFaculty", {
                required: "Faculty is required",
              })}
              className="w-full p-3 text-gray-900 border border-purple-300 rounded bg-white focus:ring focus:ring-purple-200"
            >
              <option value="">Select Faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            {errors.assignedFaculty && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedFaculty.message}</p>
            )}
          </div>
        )}

        {role === "Sub-Admin" && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Assigned Department</label>
            <select
              {...register("assignedDepartment", {
                required: "Department is required",
              })}
              className="w-full p-3 text-gray-900 border border-purple-300 rounded bg-white focus:ring focus:ring-purple-200"
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.assignedDepartment && (
              <p className="text-red-500 text-sm mt-1">{errors.assignedDepartment.message}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "⏳ Creating..." : "➕ Create Admin"}
        </button>
      </form>
    </div>
  );
}
