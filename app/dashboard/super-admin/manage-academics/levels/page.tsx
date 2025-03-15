"use client";

import { useState, useEffect, useCallback } from "react";
import LevelForm from "@/components/dashboard/manage-academics/levels/LevelForm";
import LevelList from "@/components/dashboard/manage-academics/levels/LevelList";
import { Faculty } from "@/types/types";
import { toast } from "react-hot-toast";
import Header from "@/components/dashboard/Header";

interface Level {
  _id: string;
  name: string;
  departmentId: string | { _id: string };
  courses: string[];
}

interface Department {
  _id: string;
  name: string;
  facultyId: string;
}

export default function LevelPage() {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch("/api/faculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data = await res.json();
        setFaculties(data);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        toast.error("Failed to load faculties");
      }
    };

    fetchFaculties();
  }, []);

  const fetchDepartments = useCallback(async (facultyId: string) => {
    if (!facultyId) {
      console.warn("fetchDepartments: No faculty ID provided.");
      return;
    }

    console.log(`Fetching departments for Faculty ID: ${facultyId}`);

    try {
      const res = await fetch(`/api/departments?facultyId=${facultyId}`);

      console.log("API Response Status:", res.status);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch departments: ${res.status} (${res.statusText})`
        );
      }

      const data = await res.json();

      console.log("Fetched Departments Data:", data);

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: Expected an array.");
      }

      setDepartments(data);
    } catch (error) {
      console.error("fetchDepartments: Error fetching departments:", error);
    }
  }, []);

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const departmentsRes = await fetch("/api/departments");
        if (!departmentsRes.ok) throw new Error("Failed to fetch departments");
        const departmentsData = await departmentsRes.json();
        setDepartments(departmentsData);

        const levelsRes = await fetch("/api/levels");
        if (!levelsRes.ok) throw new Error("Failed to fetch levels");
        const levelsData = await levelsRes.json();
        setLevels(levelsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/levels");
      if (!res.ok) throw new Error("Failed to fetch levels");

      const levelsData: Level[] = await res.json();

      const formattedLevels: Level[] = levelsData.map((level: Level) => ({
        _id: level._id,
        name: level.name,
        departmentId:
          typeof level.departmentId === "object"
            ? level.departmentId._id
            : level.departmentId,
        courses: level.courses ?? [],
      }));

      setLevels(formattedLevels);
    } catch (error) {
      console.error("Error fetching levels:", error);
    }
  };

  const handleSaveLevel = async (
    data: { name: string; departmentId: string },
    id?: string
  ) => {
    const method = id ? "PUT" : "POST";
    const url = id ? `/api/levels/${id}` : "/api/levels";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save level");

      toast.success(`Level ${id ? "updated" : "added"} successfully`);
      setEditingLevel(null);

      await fetchLevels();
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Failed to save level");
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level?")) return;

    try {
      const res = await fetch(`/api/levels/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete level");
      }

      toast.success("Level deleted successfully");

      await fetchLevels();
    } catch (error) {
      console.error("Error deleting level:", error);
      toast.error("Failed to delete level");
    }
  };

  return (
    <div className="p-6">
      <Header title="Manage Levels" />

      <LevelForm
        onSave={handleSaveLevel}
        faculties={faculties}
        departments={departments}
        fetchDepartments={fetchDepartments}
        editingLevel={editingLevel}
      />
      <LevelList
        levels={levels as Level[]}
        departments={departments}
        onDelete={handleDeleteLevel}
      />
    </div>
  );
}
