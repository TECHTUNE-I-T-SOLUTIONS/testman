"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [formData, setFormData] = useState({
    matricNumber: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Attempting login with data:", formData);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Login Successful!");
        setTimeout(() => {
          router.push("/student");
        }, 2000);
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during login attempt:", error);
      toast.error("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-300 p-6">
      <ToastContainer />
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-8 border border-purple-400">
        <h2 className="text-3xl font-bold text-purple-700 text-center mb-6">
          🔐 Student Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-purple-700 font-medium">Matric Number</label>
            <input
              type="text"
              name="matricNumber"
              placeholder="Enter Matric Number"
              onChange={handleChange}
              required
              className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-purple-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              onChange={handleChange}
              required
              className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-purple-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter Password"
              onChange={handleChange}
              required
              className="w-full px-4 text-gray-900 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-700 text-white font-semibold py-3 rounded-md hover:bg-purple-800 transition duration-300"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <p className="text-black text-lg">
              Don’t have an account?{" "}
              <Link
                href="/"
                className="text-purple-700 font-semibold hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
