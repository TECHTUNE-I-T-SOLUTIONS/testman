"use client";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFormStore from "@/lib/store/useStudentFormStore";
import { set } from "mongoose";
import { useEffect, useState } from "react";

const InstitutionalInfoForm = () => {
  const { formData, setFormData, setStep } = useFormStore();

  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>(
    []
  );

  const [errors, setErrors] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);
  const [levels, setLevels] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/faculties")
      .then((res) => res.json())
      .then((data) => setFaculties(Array.isArray(data) ? data : []))
      .catch(() => setErrors("Failed to load faculties."));
  }, []);
  useEffect(() => {
    if (!selectedFaculty) return;
    setDepartments([]);
    setLevels([]);
    setFormData({ ...formData, faculty: selectedFaculty });
    fetch(`/api/departments?facultyId=${selectedFaculty}`)
      .then((res) => res.json())
      .then((data) => setDepartments(Array.isArray(data) ? data : [])) // Ensure it's an array
      .catch(() => setErrors("Failed to load departments."));
  }, [selectedFaculty]);
  useEffect(() => {
    if (!selectedDepartment) return;
    setLevels([]);
    setFormData({ ...formData, department: selectedDepartment });
    fetch(`/api/levels?departmentId=${selectedDepartment}`)
      .then((res) => res.json())
      .then((data) => {
        setLevels(Array.isArray(data?.levels) ? data.levels : []); // Ensure it's an array
      })
      .catch(() => setErrors("Failed to load levels."));
  }, [selectedDepartment]);
  return (
    <>
      <CardHeader>
        <CardTitle>Institutional Details</CardTitle>
        <CardDescription>Enter your Institutional Information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Faculty Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="faculty">Faculty</Label>
            <Select
              onValueChange={(value) => {
                setSelectedFaculty(value);
              }}
            >
              <SelectTrigger id="faculty">
                <SelectValue placeholder={"Select Faculty"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {faculties.map((faculty) => (
                  <SelectItem key={faculty._id} value={faculty._id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="department">Department</Label>
            <Select
              onValueChange={(value) => {
                setSelectedDepartment(value);
              }}
            >
              <SelectTrigger id="department">
                <SelectValue placeholder={"Select Department"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {departments.map((department) => (
                  <SelectItem key={department._id} value={department._id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Level Selection */}
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="level">Level</Label>
            <Select  onValueChange={(value) => {
                setFormData({ ...formData, level: value });
              }}>
              <SelectTrigger id="level">
                <SelectValue placeholder={"Select Level"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {levels.map((level) => (
                  <SelectItem key={level._id} value={level._id}>
                    {level.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-between mt-7">
          <Button onClick={() => setStep(1)}>Back</Button>
          <Button onClick={() => setStep(3)}>Continue</Button>
        </div>
      </CardContent>
    </>
  );
};

export default InstitutionalInfoForm;
