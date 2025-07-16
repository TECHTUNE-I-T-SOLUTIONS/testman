"use client"

import { useEffect, useState } from "react"
import { Building, AlertCircle } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Department {
  _id: string
  name: string
}

interface Props {
  onChange: (id: string) => void
}

export default function DepartmentDropdown({ onChange }: Props) {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/departments")
        if (!res.ok) throw new Error("Failed to fetch departments")
        const data = await res.json()
        setDepartments(data)
      } catch (error) {
        console.error("Failed to fetch departments:", error)
        setError("Failed to load departments. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (departments.length === 0) {
    return (
      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No departments available. Please add departments first.</AlertDescription>
      </Alert>
    )
  }

  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <SelectValue placeholder="Select a department" />
        </div>
      </SelectTrigger>
      <SelectContent>
        {departments.map((dept) => (
          <SelectItem key={dept._id} value={dept._id}>
            <div className="flex items-center gap-2">
              <span>{dept.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}