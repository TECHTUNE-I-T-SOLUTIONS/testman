"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { Layers, PlusCircle, AlertCircle, BookOpen } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LevelForm from "@/components/dashboard/manage-academics/levels/LevelForm";
import LevelList from "@/components/dashboard/manage-academics/levels/LevelList";
import type { Faculty } from "@/types/types";

interface Level {
  _id: string;
  name: string;
  departmentId: string | { _id: string; name?: string };
  departmentName?: string;
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
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Switch to form tab when editing
  useEffect(() => {
    if (editingLevel) {
      setActiveTab("form");
    }
  }, [editingLevel]);

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
        setError("Failed to load faculties. Please try again.");
      }
    };

    fetchFaculties();
  }, []);

  const fetchDepartments = useCallback(async (facultyId?: string) => {
    try {
      const url = facultyId
        ? `/api/departments?facultyId=${facultyId}`
        : "/api/departments";
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch departments: ${res.status} (${res.statusText})`
        );
      }

      const data = await res.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format: Expected an array.");
      }

      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchDepartments();
        await fetchLevels();
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchDepartments]);

  const fetchLevels = async () => {
    try {
      const res = await fetch("/api/levels");
      if (!res.ok) throw new Error("Failed to fetch levels");

      const data = await res.json();

      if (!Array.isArray(data.levels) || data.levels.length === 0) {
        setLevels([]); // Set empty array if no levels exist
        toast.info("No levels found. Add a new level to get started.");
        return;
      }

      const formattedLevels: Level[] = data.levels.map((level: Level) => {
        const deptData = typeof level.departmentId === "object" ? level.departmentId : null;
      
        return {
          _id: level._id,
          name: level.name,
          departmentId: deptData?._id || "Unknown Department ID",  // FIXED: Handle null
          departmentName: deptData?.name || "Unknown Department",
          courses: level.courses ?? [],
        };
      });
      

      setLevels(formattedLevels);
    } catch (error) {
      console.error("Error fetching levels:", error);
      setError("Failed to load levels. Please try again.");
      toast.error("Failed to load levels");
    }
  };

  const handleSaveLevel = async (
    data: { name: string; departmentId: string },
    id?: string
  ) => {
    setSaving(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/levels/${id}` : "/api/levels";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save level");

      toast.success(`Level ${id ? "updated" : "added"} successfully`);
      setEditingLevel(null);
      setActiveTab("list");
      await fetchLevels();
    } catch (error) {
      console.error("Error saving level:", error);
      toast.error("Failed to save level");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/levels/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete level");
      }

      toast.success("Level deleted successfully");
      setConfirmDeleteId(null);
      await fetchLevels();
    } catch (error) {
      console.error("Error deleting level:", error);
      toast.error("Failed to delete level");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingLevel(null);
    setActiveTab("list");
  };

  const getDepartmentName = (departmentId: string): string => {
    const department = departments.find((d) => d._id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Layers className="h-8 w-8 text-primary" />
            Manage Academic Levels
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage academic levels for your departments
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingLevel(null);
            setActiveTab("form");
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Level
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Level List</TabsTrigger>
          <TabsTrigger value="form">
            {editingLevel ? "Edit Level" : "Add Level"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Academic Levels
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Loading levels..."
                  : `${levels.length} ${
                      levels.length === 1 ? "level" : "levels"
                    } found`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-4 border rounded-md"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex space-x-2">
                        <Skeleton className="h-9 w-16" />
                        <Skeleton className="h-9 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <LevelList
                  levels={levels}
                  departments={departments}
                  onEdit={setEditingLevel}
                  onDelete={handleDeleteRequest}
                  confirmDeleteId={confirmDeleteId}
                  onConfirmDelete={confirmDelete}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  deletingId={deleting}
                  getDepartmentName={getDepartmentName}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingLevel ? "Edit Level" : "Add New Level"}
              </CardTitle>
              <CardDescription>
                {editingLevel
                  ? "Update the level information"
                  : "Fill in the details to create a new academic level"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LevelForm
                onSave={handleSaveLevel}
                onCancel={handleCancelEdit}
                faculties={faculties}
                departments={departments}
                editingLevel={editingLevel}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
