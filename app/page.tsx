"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FormField from "@/components/student/signup/FormField";
import SelectField from "@/components/student/signup/SelectField";
import { FiAlertCircle } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface FormData {
  name: string;
  email: string;
  matricNumber: string;
  faculty: string;
  department: string;
  level: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: "",
      email: "",
      matricNumber: "",
      faculty: "",
      department: "",
      level: "",
      password: "",
      confirmPassword: "",
    },
  });

  const selectedFaculty = watch("faculty");
  const selectedDepartment = watch("department");

  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [levels, setLevels] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("/api/faculties")
      .then((res) => res.json())
      .then((data) => setFaculties(Array.isArray(data) ? data : [])) 
      .catch(() => setErrorMessage("Failed to load faculties."));
  }, []);

  useEffect(() => {
    if (!selectedFaculty) return;
    setDepartments([]);
    setLevels([]);
    fetch(`/api/departments?facultyId=${selectedFaculty}`)
      .then((res) => res.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : [])) // Ensure it's an array
      .catch(() => setErrorMessage("Failed to load departments."));
  }, [selectedFaculty]);

  useEffect(() => {
    if (!selectedDepartment) return;
    setLevels([]);
    fetch(`/api/levels?departmentId=${selectedDepartment}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Levels API Response:", data);
        setLevels(Array.isArray(data?.levels) ? data.levels : []); // Ensure it's an array
      })
      .catch(() => setErrorMessage("Failed to load levels."));
  }, [selectedDepartment]);

  const onSubmit = async (formData: FormData) => {
    setLoading(true);
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(" Registration Successful!");
        reset();
      } else {
        const data = await response.json();
        toast.error(data.message || " Registration failed. Try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(" An error occurred. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-purple-500 p-6">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-8 border border-purple-300">
        <h2 className="text-3xl font-bold text-purple-800 text-center mb-6">
          📋 Student Registration
        </h2>

        {errorMessage && (
          <div className="flex items-center gap-2 text-red-600 bg-red-100 p-3 rounded-md text-sm mb-4">
            <FiAlertCircle className="text-lg" /> {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            label="Full Name"
            placeholder="Enter your name"
            register={register("name", { required: "Name is required" })}
            error={errors.name?.message}
          />
          <FormField
            label="Email"
            type="email"
            placeholder="Enter your email"
            register={register("email", { required: "Email is required" })}
            error={errors.email?.message}
          />
          <FormField
            label="Matric Number"
            placeholder="Matric Number"
            register={register("matricNumber", { required: "Matric Number is required" })}
            error={errors.matricNumber?.message}
          />

          <SelectField
            label="Faculty"
            options={faculties.map((faculty) => ({
              value: faculty._id,
              label: faculty.name,
            }))}
            register={register("faculty", { required: "Faculty is required" })}
            error={errors.faculty?.message}
          />

          <SelectField
            label="Department"
            options={departments.map((department) => ({
              value: department._id,
              label: department.name,
            }))}
            register={register("department", { required: "Department is required" })}
            error={errors.department?.message}
          />

          <SelectField
            label="Level"
            options={Array.isArray(levels) ? levels.map((level) => ({
              value: level._id,
              label: level.name,
            })) : []}
            register={register("level", { required: "Level is required" })}
            error={errors.level?.message}
          />

          <FormField
            label="Password"
            type="password"
            placeholder="Create a password"
            register={register("password", { required: "Password is required", minLength: { value: 6, message: "Password must be at least 6 characters" } })}
            error={errors.password?.message}
          />
          <FormField
            label="Confirm Password"
            type="password"
            placeholder="Confirm password"
            register={register("confirmPassword", { required: "Please confirm your password" })}
            error={errors.confirmPassword?.message}
          />

          <button
            type="submit"
            className="w-full bg-purple-700 text-white font-semibold py-3 rounded-md hover:bg-purple-800 transition duration-300 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <p className="text-center text-black text-lg mt-3">
            Already have an account?{" "}
            <a href="/login" className="text-purple-700 font-semibold hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
