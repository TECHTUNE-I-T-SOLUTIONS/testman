"use client";
import { useState, useEffect } from "react";
import FacultyForm from "@/components/dashboard/manage-academics/faculty/FacultyForm";
import FacultyList from "@/components/dashboard/manage-academics/faculty/FacultyList";
import Header from "@/components/dashboard/Header";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Faculty, FacultyInput } from "@/types/types";

export default function Faculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  useEffect(() => {
    fetchFaculties();
  }, []);

  const fetchFaculties = async () => {
    try {
      const response = await fetch("/api/faculties");
      if (!response.ok) {
        throw new Error("Failed to fetch faculties");
      }
      const data: Faculty[] = await response.json();
      setFaculties(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch faculties.");
    }
  };

  const handleSave = async (facultyInput: FacultyInput) => {
    try {
      let response;

      if (editingFaculty?._id) {
        console.log("Editing Faculty:", editingFaculty);

        response = await fetch(`/api/faculties`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingFaculty._id, ...facultyInput }), 
        });

        if (!response.ok) {
          throw new Error("Failed to update faculty.");
        }

        toast.success("Faculty updated successfully.");
      } else {
        response = await fetch("/api/faculties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(facultyInput),
        });

        if (!response.ok) {
          throw new Error("Failed to create faculty.");
        }

        toast.success("Faculty created successfully.");
      }

      setEditingFaculty(null); 
      fetchFaculties(); 
    } catch (error) {
      console.error("Failed to save faculty:", error);
      toast.error((error as Error).message || "An unexpected error occurred.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting Faculty ID:", id); 

      if (!id) {
        toast.error("Invalid faculty ID.");
        return;
      }

      const response = await fetch(`/api/faculties?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete faculty.");
      }

      toast.success("Faculty deleted successfully.");
      fetchFaculties(); 
    } catch (error) {
      console.error("Failed to delete faculty:", error);
      toast.error((error as Error).message || "An unexpected error occurred.");
    }
  };

  return (
    <div>
      <Header title="Manage Faculties" />
      <FacultyForm
        onSave={handleSave}
        editingFaculty={
          editingFaculty
            ? {
                id: editingFaculty._id,
                name: editingFaculty.name,
                session: editingFaculty.session,
              }
            : null
        }
      />

      <FacultyList
        faculties={faculties}
        onEdit={setEditingFaculty}
        onDelete={handleDelete}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
