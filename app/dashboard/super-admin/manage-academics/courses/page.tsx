"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { BookOpen, PlusCircle, AlertCircle, Library } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CourseForm from "@/components/dashboard/manage-academics/courses/CourseForm";
import CourseList from "@/components/dashboard/manage-academics/courses/CourseList";
import { Level } from "@/types/types";

type Course = {
  _id: string;
  name: string;
  code: string;
  facultyId: string;
  departmentId: { _id: string; name: string } | string;
  levelId: { _id: string; name: string } | string;
};

type Department = {
  _id: string;
  name: string;
  levels: Level[];
};

export default function CoursesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("list");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Switch to form tab when editing
  useEffect(() => {
    if (editingCourse) {
      setActiveTab("form");
    }
  }, [editingCourse]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");

      const courses: Course[] = await response.json();
      
      const departmentMap = new Map<string, Department>();

      courses.forEach((course) => {
        const departmentId = typeof course.departmentId === 'object' ? course.departmentId : { _id: course.departmentId as string, name: "Unknown" };
        const levelId = typeof course.levelId === 'object' ? course.levelId : { _id: course.levelId as string, name: "Unknown" };

        if (!departmentMap.has(departmentId._id)) {
          departmentMap.set(departmentId._id, {
            _id: departmentId._id,
            name: departmentId.name,
            levels: [],
          });
        }

        const department = departmentMap.get(departmentId._id)!;
        let level = department.levels.find((lvl) => lvl._id === levelId._id);

        if (!level) {
          level = {
            _id: levelId._id,
            name: levelId.name,
            departmentId: departmentId._id,
            courses: [],
          };
          department.levels.push(level);
        }

        level.courses.push({
          _id: course._id,
          name: course.name,
          code: course.code,
        });
      });

      setDepartments(Array.from(departmentMap.values()));
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      toast.error("Failed to load courses");
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async (courseData: Course | Omit<Course, "_id">) => {
    setSaving(true);
    try {
      const formattedData = {
        ...courseData,
        departmentId:
          typeof courseData.departmentId === "object"
            ? courseData.departmentId._id
            : courseData.departmentId,
        levelId:
          typeof courseData.levelId === "object"
            ? courseData.levelId._id
            : courseData.levelId,
      };

      const method = "_id" in courseData ? "PUT" : "POST";
      const isUpdate = method === "PUT";

      const response = await fetch("/api/courses", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isUpdate ? 'update' : 'create'} course`);
      }

      toast.success(`Course ${isUpdate ? 'updated' : 'created'} successfully`);
      setEditingCourse(undefined);
      setActiveTab("list");
      fetchCourses();
    } catch (err) {
      console.error("Error adding/updating course:", err);
      toast.error((err as Error).message || `Failed to ${courseData._id ? 'update' : 'create'} course`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course: Course) => setEditingCourse(course);

  const handleDeleteRequest = (id: string) => {
    setConfirmDeleteId(id);
  };

  const confirmDelete = async (id: string) => {
    setDeleting(id);
    try {
      const response = await fetch("/api/courses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Course deleted successfully");
      setConfirmDeleteId(null);
      fetchCourses();
    } catch (err) {
      console.error("Error deleting course:", err);
      toast.error((err as Error).message || "Failed to delete course");
    } finally {
      setDeleting(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingCourse(undefined);
    setActiveTab("list");
  };

  return (
    <div className="container max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Library className="h-8 w-8 text-primary" />
            Manage Courses
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage courses for your academic departments and levels
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingCourse(undefined);
            setActiveTab("form");
          }}
          className="shrink-0"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="list">Course List</TabsTrigger>
          <TabsTrigger value="form">
            {editingCourse ? "Edit Course" : "Add Course"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Catalog
              </CardTitle>
              <CardDescription>
                {loading 
                  ? "Loading courses..." 
                  : departments.length === 0 
                    ? "No courses found" 
                    : "Courses organized by department and level"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-6">
                  {[1, 2].map((i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-6 w-48" />
                      <div className="space-y-2 pl-4">
                        <Skeleton className="h-5 w-36" />
                        <div className="space-y-2 pl-4">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="flex justify-between items-center p-3 border rounded-md">
                              <div className="space-y-2">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-4 w-40" />
                              </div>
                              <div className="flex space-x-2">
                                <Skeleton className="h-9 w-16" />
                                <Skeleton className="h-9 w-16" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <CourseList
                  departments={departments}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
                  confirmDeleteId={confirmDeleteId}
                  onConfirmDelete={confirmDelete}
                  onCancelDelete={() => setConfirmDeleteId(null)}
                  deletingId={deleting}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingCourse ? "Edit Course" : "Add New Course"}
              </CardTitle>
              <CardDescription>
                {editingCourse 
                  ? "Update the course information" 
                  : "Fill in the details to create a new course"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm 
                onSubmit={handleAddOrUpdate} 
                initialData={editingCourse}
                onCancel={handleCancelEdit}
                saving={saving}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
