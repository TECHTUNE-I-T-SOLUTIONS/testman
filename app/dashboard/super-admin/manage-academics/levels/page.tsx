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
  departmentId: string;
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
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch("/api/faculties");
        if (!res.ok) throw new Error("Failed to fetch faculties");
        const data = await res.json();
        setFaculties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching faculties:", error);
        toast.error("Failed to load faculties");
      }
    };
    fetchFaculties();
  }, []);

  const fetchDepartments = useCallback(async (facultyId: string) => {
    if (!facultyId) return;
    try {
      const res = await fetch(`/api/departments?facultyId=${facultyId}`);
      if (!res.ok) throw new Error("Failed to fetch departments");
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    }
  }, []);

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/levels");
      if (!res.ok) throw new Error("Failed to fetch levels");
      const data = await res.json();
      const levelsData = Array.isArray(data) ? data : data.levels || [];
      setLevels(levelsData.map(level => ({
        _id: level._id,
        name: level.name,
        departmentId: typeof level.departmentId === "object" ? level.departmentId._id : level.departmentId,
        courses: level.courses || [],
      })));
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchDepartments("");
        await fetchLevels();
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
<<<<<<< HEAD
  }, [fetchDepartments]);
=======
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
>>>>>>> c2d39236dd1437df85614c700e8704bd4cb5a935

  const handleSaveLevel = async (data: { name: string; departmentId: string }, id?: string) => {
    try {
      const res = await fetch(id ? `/api/levels/${id}` : "/api/levels", {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save level");
      toast.success(`Level ${id ? "updated" : "added"} successfully`);
      setEditingLevel(null);
      await fetchLevels();
    } catch (err) {
      const error = err as Error
      console.error("Error saving level:", error);
      toast.error(error.message || "Failed to save level");
    }
  };

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level?")) return;
    try {
      const res = await fetch(`/api/levels/${id}`, { method: "DELETE" });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to delete level");
      toast.success("Level deleted successfully");
      await fetchLevels();
    } catch (err) {
      const error = err as Error;
      console.error("Error deleting level:", error);
      toast.error(error.message || "Failed to delete level");
    }
  };

  if (loading) return <div>Loading...</div>;

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
        levels={levels}
        departments={departments}
        onDelete={handleDeleteLevel}
      />
    </div>
  );
}
