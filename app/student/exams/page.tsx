"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Clock, FileText, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentFromToken } from "@/utils/auth"; // Adjust path if needed
import type { Student } from "@/types/types";

type Course = {
  _id: string;
  name: string;
  code: string;  // Ensure this matches the model
  facultyId: string;
  departmentId: string;
  levelId: string;
  duration?: number;
  questionCount?: number;
  description?: string;
};




export default function Exams() {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [relevantCourses, setRelevantCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const tokenStudent = await getStudentFromToken();
        if (!tokenStudent?.matricNumber) return;

        const encodedMatric = encodeURIComponent(tokenStudent.matricNumber);
        const res = await fetch(`/api/students/${encodedMatric}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch student");

        setStudent(data);
      } catch (err) {
        console.error("Failed to fetch student", err);
        setError("Failed to load student details.");
        toast.error("Failed to load student details.");
      }
    };

    fetchStudentDetails();
  }, []);


  useEffect(() => {
    const fetchCourses = async () => {
      if (!student?.faculty?._id) return;

      try {
        setLoading(true);
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");

        const courses: Course[] = await res.json();
        setAllCourses(courses);

        const relevant = courses.filter(course => course.facultyId === student.faculty._id);
        setRelevantCourses(relevant);
      } catch (err) {
        console.error("Error fetching courses", err);
        toast.error("Error fetching courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [student]);

  useEffect(() => {
    if (selectedCourse) {
      const courseDetails = [...allCourses].find(course => course._id === selectedCourse) || null;
      setSelectedCourseDetails(courseDetails);
    } else {
      setSelectedCourseDetails(null);
    }
  }, [selectedCourse, allCourses]);

  const handleStartExam = () => {
    if (!selectedCourse) {
      toast.info("Please select a course first.");
      return;
    }
    
    // Show a confirmation toast before redirecting
    toast.info("Preparing your exam...");
    router.push(`/student/exams/${selectedCourse}`);
  };

  const otherCourses = allCourses.filter(
    (course) => course.facultyId !== student?.faculty?._id
  );

  const filteredSearchResults = otherCourses.filter((course) =>
    `${course.code} ${course.name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSupportModalOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSupportClick = () => {
    setSupportModalOpen(true);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl text-center font-bold mb-2">Take an Exam</h1>
      <p className="text-center text-muted-foreground mb-8">Select a course and start your assessment</p>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Course Selection</span>
            </CardTitle>
            <CardDescription className="text-center">
              Choose from your enrolled courses to begin an exam
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error ? (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <div className="mt-4">
              <label htmlFor="search" className="text-sm font-medium">Search Other Courses (outside your faculty)</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search courses by code or name"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {searchTerm && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-2">Results outside your faculty:</p>
                <ul className="space-y-1 text-sm">
                  {filteredSearchResults.map((course) => (
                    <li
                      key={course._id}
                      className="cursor-pointer text-primary hover:underline"
                      onClick={() => {
                        setSelectedCourse(course._id);
                        setSearchTerm(""); // optionally clear search
                      }}
                    >
                      {course.code} - {course.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="courseSelect" className="text-sm font-medium">
                  Select Course (for your faculty)
                </label>
                
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger id="courseSelect" className="w-full">
                      <SelectValue placeholder="-- Select a Course --" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevantCourses.length > 0 ? (
                        <>
                          {relevantCourses.map((course) => (
                            <SelectItem key={course._id} value={course._id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </>
                      ) : (
                        <SelectItem value="no-courses" disabled>
                          No courses available for your faculty
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div> 
              {selectedCourse && selectedCourseDetails && (
                <div className="mt-4 bg-amber-300 border border-dashed border-primary p-4 rounded-md">
                  <h3 className="font-bold text-sm text-primary mb-2">
                    Selected Course{!relevantCourses.find(course => course._id === selectedCourse) ? " (Outside Faculty)" : ""}
                  </h3>
                  <p className="text-sm font-semibold">{selectedCourseDetails.name}</p>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    {selectedCourseDetails.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{selectedCourseDetails.duration} minutes</span>
                      </div>
                    )}
                    {selectedCourseDetails.questionCount && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>{selectedCourseDetails.questionCount} questions</span>
                      </div>
                    )}
                  </div>
                  {selectedCourseDetails.description && (
                    <p className="text-xs text-muted-foreground mt-2">{selectedCourseDetails.description}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleStartExam} 
              disabled={!selectedCourse || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : !selectedCourse ? (
                "Select a Course to Start"
              ) : (
                <>
                  Start Exam
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-base">Exam Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Time limits vary by course. Once started, the timer cannot be paused.</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>Ensure you have a stable internet connection before starting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>All questions must be answered to complete the exam.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-center text-muted-foreground mb-4">
                If you encounter any issues during the exam, please contact support.
              </p>
              <Button variant="outline" size="sm" className="w-full" onClick={handleSupportClick}>
                Contact Support
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
      {supportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg text-center font-semibold mb-2">Contact Support</h2>
            <p className="text-sm text-center text-muted-foreground mb-4">
              Click the button below to message an admin directly on WhatsApp.
            </p>

            <a
              href="https://wa.me/2348035770623?text=Hello%20Admin%2C%20I%20need%20help%20with%20my%20exam"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full mb-4">
                Message on WhatsApp
              </Button>
            </a>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSupportModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>  
  );
}