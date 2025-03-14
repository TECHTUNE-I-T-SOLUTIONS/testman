"use client";
import { useState, useEffect } from "react";
import DepartmentForm from "@/components/dashboard/manage-academics/department/DepartmentForm";
import DepartmentList from "@/components/dashboard/manage-academics/department/DepartmentList";
import Header from "@/components/dashboard/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Faculty } from "@/types/types"; 

type Department = {
  _id: string;
  name: string;
  facultyId: string;
};

type DepartmentInput = {
  name: string;
  facultyId: string;
};

type DepartmentAPIResponse = {
  _id: string;
  name: string;
  facultyId: { _id: string } | string;
};

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await fetch("/api/faculties");
      if (!response.ok) throw new Error("Failed to fetch faculties");
      const data = await response.json();
      setFaculties(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch faculties.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      if (!response.ok) throw new Error("Failed to fetch departments");

      const data: DepartmentAPIResponse[] = await response.json();

      const transformedDepartments = data.map((dept) => ({
        _id: dept._id,
        name: dept.name,
        facultyId:
          typeof dept.facultyId === "object"
            ? dept.facultyId._id
            : dept.facultyId,
      }));

      setDepartments(transformedDepartments);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch departments.");
    }
  };

  const handleSave = async (departmentInput: DepartmentInput) => {
    try {
      let response;

      if (editingDepartment?._id) {
        response = await fetch(`/api/departments?id=${editingDepartment._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(departmentInput),
        });
        toast.success("Department updated successfully.");
      } else {
        response = await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(departmentInput),
        });
        toast.success("Department created successfully.");
      }

      if (!response.ok) throw new Error("Failed to save department.");

      setEditingDepartment(null);
      fetchDepartments();
    } catch (error) {
      console.error("Failed to save department:", error);
      toast.error("An error occurred.");
    }
  };

  const handleDeleteRequest = (id: string) => {
    console.log("Selected Department ID:", id);
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      console.log("Deleting Department ID:", id);

      const url = `/api/departments?id=${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to delete department.");
      }

      toast.success("Department deleted successfully.");
      setConfirmDeleteId(null);
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
      toast.error((error as Error).message || "An unexpected error occurred.");
    }
  };

  return (
    <div>
      <Header title="Manage Departments" />
      <ToastContainer position="top-right" autoClose={3000} />
      <DepartmentForm
        onSave={handleSave}
        editingDepartment={editingDepartment}
        faculties={faculties}
      />

      <DepartmentList
        departments={departments}
        onEdit={(department: Department) => setEditingDepartment(department)}
        onDelete={handleDeleteRequest}
        confirmDeleteId={confirmDeleteId}
        onConfirmDelete={confirmDelete}
        onCancelDelete={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
