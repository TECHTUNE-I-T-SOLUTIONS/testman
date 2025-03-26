"use client";

import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Course } from "@/types/types";
import { toast } from "sonner";

// Define the schema for form validation
const courseSchema = z.object({
  name: z.string().min(2, { message: "Course name must be at least 2 characters" }),
  code: z.string().min(2, { message: "Course code must be at least 2 characters" }),
  facultyId: z.string().min(1, { message: "Please select a faculty" }),
  departmentId: z.string().min(1, { message: "Please select a department" }),
  levelId: z.string().min(1, { message: "Please select a level" }),
});

type CourseFormValues = z.infer<typeof courseSchema>;


interface Faculty {
  _id: string;
  name: string;
}

interface Department {
  _id: string;
  name: string;
  facultyId: string;
}

interface Level {
  _id: string;
  name: string;
  departmentId: string;
}

interface CourseFormProps {
  onSubmit: (data: Course) => Promise<void>;
  initialData?: Course;
  onCancel?: () => void;
  saving?: boolean;
}

export default function CourseForm({ 
  onSubmit, 
  initialData, 
  onCancel,
  saving = false
}: CourseFormProps) {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [filteredLevels, setFilteredLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: "",
      code: "",
      facultyId: "",
      departmentId: "",
      levelId: "",
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const facultiesRes = await fetch("/api/faculties");
        if (!facultiesRes.ok) throw new Error("Failed to fetch faculties");
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData);

        const departmentsRes = await fetch("/api/departments");
        if (!departmentsRes.ok) throw new Error("Failed to fetch departments");

        const levelsRes = await fetch("/api/levels");
        if (!levelsRes.ok) throw new Error("Failed to fetch levels");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDepartments = useCallback(async (facultyId: string) => {
    try {
      const res = await fetch(`/api/departments?facultyId=${facultyId}`);
      if (!res.ok) throw new Error(`Failed to fetch departments: ${res.status} (${res.statusText})`);
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error("Invalid data format: Expected an array.");
      setFilteredDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments");
      setFilteredDepartments([]);
    }
  }, []);

  const fetchLevels = useCallback(async (departmentId: string) => {
    try {
      const res = await fetch(`/api/levels?departmentId=${departmentId}`);
      if (!res.ok) throw new Error(`Failed to fetch levels: ${res.status} (${res.statusText})`);
      
      const data = await res.json();
      console.log("Fetched Levels:", data); // Debugging log
  
      // Adjust depending on API response structure
      const levelsArray = Array.isArray(data) ? data : data.levels;
      
      if (!Array.isArray(levelsArray)) throw new Error("Invalid data format: Expected an array.");
      if (levelsArray.length === 0) {
        toast.error("No levels found for the selected department");
      }
  
      setFilteredLevels(levelsArray);
    } catch (error) {
      console.error("Error fetching levels:", error);
      toast.error("Failed to load levels");
      setFilteredLevels([]);
    }
  }, []);
  
  const handleFacultyChange = async (facultyId: string) => {
    form.setValue("facultyId", facultyId);
    form.setValue("departmentId", "");
    form.setValue("levelId", "");
    if (facultyId) {
      await fetchDepartments(facultyId);
    } else {
      setFilteredDepartments([]);
    }
    setFilteredLevels([]);
  };

  const handleDepartmentChange = async (departmentId: string) => {
    form.setValue("departmentId", departmentId);
    form.setValue("levelId", "");
    if (departmentId) {
      await fetchLevels(departmentId);
    } else {
      setFilteredLevels([]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., Introduction to Computer Science" 
                    {...field} 
                    disabled={saving || loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Code</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., CSC101" 
                    {...field} 
                    disabled={saving || loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="facultyId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faculty</FormLabel>
              <Select 
                onValueChange={(value) => handleFacultyChange(value)}
                value={field.value}
                disabled={saving || loading || faculties.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loading 
                        ? "Loading faculties..." 
                        : faculties.length === 0 
                          ? "No faculties available" 
                          : "Select a faculty"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {faculties.map((faculty) => (
                    <SelectItem key={faculty._id} value={faculty._id}>
                      {faculty.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select 
                onValueChange={(value) => handleDepartmentChange(value)}
                value={field.value}
                disabled={saving || loading || filteredDepartments.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loading 
                        ? "Loading departments..." 
                        : !form.getValues().facultyId 
                          ? "Select a faculty first" 
                          : filteredDepartments.length === 0 
                            ? "No departments available" 
                            : "Select a department"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredDepartments.map((department) => (
                    <SelectItem key={department._id} value={department._id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="levelId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Level</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
                disabled={saving || loading || filteredLevels.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      loading 
                        ? "Loading levels..." 
                        : !form.getValues().departmentId 
                          ? "Select a department first" 
                          : filteredLevels.length === 0 
                            ? "No levels available" 
                            : "Select a level"
                    } />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {filteredLevels.map((level) => (
                    <SelectItem key={level._id} value={level._id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={saving || loading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData?._id ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData?._id ? "Update Course" : "Create Course"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
