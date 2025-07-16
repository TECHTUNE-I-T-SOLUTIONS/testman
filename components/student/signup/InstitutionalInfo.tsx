"use client"

import { Button } from "@/components/ui/button"
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import useFormStore from "@/lib/store/useStudentFormStore"
import { useEffect, useState } from "react"

const InstitutionalInfoForm = () => {
  const { formData, setFormData, setStep } = useFormStore()
  const [faculties, setFaculties] = useState<{ _id: string; name: string }[]>([])
  const [errors, setErrors] = useState("")
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([])
  const [levels, setLevels] = useState<{ _id: string; name: string }[]>([])

  useEffect(() => {
    fetch("/api/faculties")
      .then((res) => res.json())
      .then((data) => setFaculties(Array.isArray(data) ? data : []))
      .catch(() => setErrors("Failed to load faculties."))
  }, [])

useEffect(() => {
  if (!selectedFaculty) return
  setDepartments([])
  setLevels([])

  setFormData({ ...formData, faculty: selectedFaculty })

  fetch(`/api/departments?facultyId=${selectedFaculty}`)
    .then((res) => res.json())
    .then((data) => setDepartments(Array.isArray(data) ? data : []))
    .catch(() => setErrors("Failed to load departments."))
}, [selectedFaculty]) // ✅ Removed `formData` from here


useEffect(() => {
  if (!selectedDepartment) return
  setLevels([])

  setFormData({ ...formData, department: selectedDepartment })

  fetch(`/api/levels?departmentId=${selectedDepartment}`)
    .then((res) => res.json())
    .then((data) => {
      setLevels(Array.isArray(data?.levels) ? data.levels : [])
    })
    .catch(() => setErrors("Failed to load levels."))
}, [selectedDepartment]) // ✅ Removed `formData` from here


  return (
    <>
      <CardHeader className="space-y-4 pb-8">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Institution Details</CardTitle>
          <CardDescription className="text-slate-600">Tell us about your academic institution</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        {errors && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">{errors}</div>}

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="faculty" className="text-sm font-medium text-slate-700">
              Faculty
            </Label>
            <Select onValueChange={(value) => setSelectedFaculty(value)}>
              <SelectTrigger
                id="faculty"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
              >
                <SelectValue placeholder="Select your faculty" />
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

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-slate-700">
              Department
            </Label>
            <Select onValueChange={(value) => setSelectedDepartment(value)} disabled={!selectedFaculty}>
              <SelectTrigger
                id="department"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 disabled:opacity-50"
              >
                <SelectValue placeholder="Select your department" />
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

          <div className="space-y-2">
            <Label htmlFor="level" className="text-sm font-medium text-slate-700">
              Academic Level
            </Label>
            <Select
              onValueChange={(value) => {
                // Use functional update to prevent infinite loops
                setFormData({ ...formData, level: value })
              }}
              disabled={!selectedDepartment}
            >
              <SelectTrigger
                id="level"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 disabled:opacity-50"
              >
                <SelectValue placeholder="Select your level" />
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

        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep(1)}
            className="h-11 px-8 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => setStep(3)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default InstitutionalInfoForm
