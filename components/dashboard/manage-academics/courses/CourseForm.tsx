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

type UnknownJson = Record<string, unknown>;
type FacultyApiResponse = Faculty | { faculty: Faculty };

async function fetchJsonSafe<T = UnknownJson>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

function isFaculty(obj: unknown): obj is Faculty {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    'name' in obj
  ) {
    const f = obj as { _id: unknown; name: unknown };
    return typeof f._id === 'string' && typeof f.name === 'string';
  }
  return false;
}

function isLevel(obj: unknown): obj is Level {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    '_id' in obj &&
    'name' in obj &&
    'departmentId' in obj
  ) {
    const level = obj as Partial<Level>;
    return (
      typeof level._id === 'string' &&
      typeof level.name === 'string' &&
      typeof level.departmentId === 'string'
    );
  }
  return false;
}


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
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      name: initialData?.name || "",
      code: initialData?.code || "",
      facultyId: typeof initialData?.facultyId === "object" ? initialData.facultyId._id : initialData?.facultyId || "",
      departmentId: typeof initialData?.departmentId === "object" ? initialData.departmentId._id : initialData?.departmentId || "",
      levelId: typeof initialData?.levelId === "object" ? initialData.levelId._id : initialData?.levelId || "",
    },
  });


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
    console.log("fetchLevels called with:", departmentId); // Debug
    try {
      const res = await fetch(`/api/levels?departmentId=${departmentId}`);
      if (!res.ok) throw new Error(`Failed to fetch levels: ${res.status} (${res.statusText})`);
      
      const data = await res.json();
      console.log("Fetched Levels:", data);

      let levelsArray: Level[] = [];

      if (Array.isArray(data)) {
        levelsArray = data;
      } else if (Array.isArray(data.levels)) {
        levelsArray = data.levels;
      } else {
        throw new Error("Invalid data format for levels");
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

      // ✅ Fetch and set the selected faculty
      try {
        const facultyRes: FacultyApiResponse = await fetchJsonSafe(`/api/faculties/${facultyId}`);
        const maybeFaculty = 'faculty' in facultyRes ? facultyRes.faculty : facultyRes;

        if ('_id' in maybeFaculty && 'name' in maybeFaculty) {
          setSelectedFaculty(maybeFaculty);
        } else {
          console.error("Invalid faculty response shape", facultyRes);
          setSelectedFaculty(null);
        }
      } catch (error) {
        console.error("Error fetching selected faculty:", error);
        toast.error("Failed to load selected faculty");
        setSelectedFaculty(null);
      }

    } else {
      setFilteredDepartments([]);
      setSelectedFaculty(null);
    }

    setFilteredLevels([]);
  };


  const handleDepartmentChange = async (departmentId: string) => {
    if (typeof departmentId !== "string") {
      console.error("Invalid departmentId type", departmentId);
      return;
    }

    form.setValue("departmentId", departmentId);
    form.setValue("levelId", "");
    await fetchLevels(departmentId);
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const facultiesRes = await fetch("/api/faculties");
        if (!facultiesRes.ok) throw new Error("Failed to fetch faculties");
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData);

        if (initialData?.facultyId) {
          const facultyId = typeof initialData.facultyId === "object"
            ? initialData.facultyId._id
            : initialData.facultyId;

          if (facultyId && typeof facultyId === "string" && facultyId.trim() !== "") {
            try {
              const facultyRes = await fetchJsonSafe(`/api/faculties/${facultyId}`);

              if (Array.isArray(facultyRes)) {
                const faculty = facultyRes.find((f: Faculty) => f._id === facultyId);
                if (faculty) {
                  setSelectedFaculty(faculty);
                } else {
                  console.error("Faculty not found in list:", facultyId);
                  setSelectedFaculty(null);
                }
              } else if (isFaculty(facultyRes)) {
                setSelectedFaculty(facultyRes);
              } else if ('faculty' in facultyRes && isFaculty(facultyRes.faculty)) {
                setSelectedFaculty(facultyRes.faculty);
              } else {
                console.error("Unexpected faculty data shape:", facultyRes);
                setSelectedFaculty(null);
              }

              form.setValue("facultyId", facultyId);
              await fetchDepartments(facultyId);
            } catch (error) {
              console.error("Error fetching selected faculty:", error);
              toast.error("Failed to load selected faculty");
            }
          } else {
            console.warn("Invalid facultyId provided:", facultyId);
          }
        }


        if (initialData?.departmentId) {
          const departmentId = typeof initialData.departmentId === "object"
            ? initialData.departmentId._id
            : initialData.departmentId;

          const department = await fetchJsonSafe<Department>(`/api/departments/${departmentId}`);
          setSelectedDepartment(department);
          form.setValue("departmentId", departmentId);
          await fetchLevels(departmentId);
        }

        if (initialData?.levelId) {
          const levelId = typeof initialData.levelId === "object"
            ? initialData.levelId._id
            : initialData.levelId;

          const level = await fetchJsonSafe(`/api/levels/${levelId}`);

          if (isLevel(level)) {
            setSelectedLevel(level);
          } else {
            console.error("Invalid level data format", level);
            toast.error("Invalid level data received");
            setSelectedLevel(null);
          }

          form.setValue("levelId", levelId);
        }

      } catch (error) {
        console.error("Error fetching initial form data:", error);
        toast.error("Failed to load form data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [initialData, fetchDepartments, fetchLevels, form]);



  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((formValues) => {
          const formattedData: Course = {
            ...initialData,
            name: formValues.name,
            code: formValues.code,
            facultyId: formValues.facultyId,
            departmentId: formValues.departmentId,
            levelId: formValues.levelId,
          };
          onSubmit(formattedData);
        })}
        className="space-y-6"
      >

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
              <FormLabel>
                Faculty
                {selectedFaculty?.name ? (
                  <span className="ml-2 text-muted-foreground">({selectedFaculty.name})</span>
                ) : (
                  !loading && form.getValues().facultyId && (
                    <span className="ml-2 text-muted-foreground">(Loading faculty name...)</span>
                  )
                )}
              </FormLabel>


              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleFacultyChange(value);
                }}
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
                          : faculties.find(f => f._id === form.getValues().facultyId)?.name || "Select a faculty"
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
              <FormLabel>
                Department
                {selectedDepartment?.name && (
                  <span className="ml-2 text-muted-foreground">({selectedDepartment.name})</span>
                )}
              </FormLabel>

              <Select 
                onValueChange={(value) => {
                  field.onChange(value);
                  handleDepartmentChange(value);
                }}
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
              <FormLabel>
                Level
                {selectedLevel?.name && (
                  <span className="ml-2 text-muted-foreground">({selectedLevel.name})</span>
                )}
              </FormLabel>

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

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={saving}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Course" : "Create Course"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
