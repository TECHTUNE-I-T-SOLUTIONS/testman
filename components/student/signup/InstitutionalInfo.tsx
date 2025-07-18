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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFaculty])

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment])

  return (
    <>
      <CardHeader className="space-y-4 pb-8">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Institution Details
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-200">
            Tell us about your academic institution
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pb-8">
        {errors && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:text-red-200 dark:bg-red-900/30 dark:border-red-400">
            {errors}
          </div>
        )}

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label
              htmlFor="faculty"
              className="text-sm font-medium text-slate-700 dark:text-slate-100"
            >
              Faculty
            </Label>
            <Select onValueChange={(value) => setSelectedFaculty(value)}>
              <SelectTrigger
                id="faculty"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 dark:border-slate-600 dark:focus:border-slate-400 dark:bg-slate-900"
              >
                <SelectValue
                  placeholder="Select your faculty"
                  className="dark:text-white"
                />
              </SelectTrigger>
              <SelectContent position="popper" className="dark:bg-slate-900 dark:text-white">
                {faculties.map((faculty) => (
                  <SelectItem
                    key={faculty._id}
                    value={faculty._id}
                    className="dark:text-white dark:hover:bg-slate-800"
                  >
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-sm font-medium text-slate-700 dark:text-slate-100"
            >
              Department
            </Label>
            <Select onValueChange={(value) => setSelectedDepartment(value)} disabled={!selectedFaculty}>
              <SelectTrigger
                id="department"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 disabled:opacity-50 dark:border-slate-600 dark:focus:border-slate-400 dark:bg-slate-900"
              >
                <SelectValue
                  placeholder="Select your department"
                  className="dark:text-white"
                />
              </SelectTrigger>
              <SelectContent position="popper" className="dark:bg-slate-900 dark:text-white">
                {departments.map((department) => (
                  <SelectItem
                    key={department._id}
                    value={department._id}
                    className="dark:text-white dark:hover:bg-slate-800"
                  >
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="level"
              className="text-sm font-medium text-slate-700 dark:text-slate-100"
            >
              Academic Level
            </Label>
            <Select
              onValueChange={(value) => {
                setFormData({ ...formData, level: value })
              }}
              disabled={!selectedDepartment}
            >
              <SelectTrigger
                id="level"
                className="h-11 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 disabled:opacity-50 dark:border-slate-600 dark:focus:border-slate-400 dark:bg-slate-900"
              >
                <SelectValue
                  placeholder="Select your level"
                  className="dark:text-white"
                />
              </SelectTrigger>
              <SelectContent position="popper" className="dark:bg-slate-900 dark:text-white">
                {levels.map((level) => (
                  <SelectItem
                    key={level._id}
                    value={level._id}
                    className="dark:text-white dark:hover:bg-slate-800"
                  >
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
            className="h-11 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-white dark:hover:bg-slate-800"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={() => setStep(3)}
            className="h-11 px-8 bg-slate-900 hover:bg-slate-800 text-white font-medium dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </>
  )
}

export default InstitutionalInfoForm
