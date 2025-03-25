"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookOpen, Clock, FileText, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type Course = {
  _id: string;
  name: string;
  // Adding optional fields that would be useful if available
  duration?: number; // in minutes
  questionCount?: number;
  description?: string;
};

export default function Exams() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch("/api/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");

        const data: Course[] = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setError("Unable to load available courses. Please try again later.");
        toast.error("Error fetching courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      const courseDetails = courses.find(course => course._id === selectedCourse) || null;
      setSelectedCourseDetails(courseDetails);
    } else {
      setSelectedCourseDetails(null);
    }
  }, [selectedCourse, courses]);

  const handleStartExam = () => {
    if (!selectedCourse) {
      toast.info("Please select a course first.");
      return;
    }
    
    // Show a confirmation toast before redirecting
    toast.info("Preparing your exam...");
    router.push(`/student/exams/${selectedCourse}`);
  };

  return (
    <div className="container max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Take an Exam</h1>
      <p className="text-muted-foreground mb-8">Select a course and start your assessment</p>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Course Selection</span>
            </CardTitle>
            <CardDescription>
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
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="courseSelect" className="text-sm font-medium">
                  Select Course
                </label>
                
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger id="courseSelect" className="w-full">
                      <SelectValue placeholder="-- Select a Course --" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.length === 0 ? (
                        <SelectItem value="no-courses" disabled>
                          No courses available
                        </SelectItem>
                      ) : (
                        courses.map((course) => (
                          <SelectItem key={course._id} value={course._id}>
                            {course.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              {selectedCourseDetails && (
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{selectedCourseDetails.name}</h3>
                    <Badge variant="outline">Selected</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {selectedCourseDetails.duration && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCourseDetails.duration} minutes</span>
                      </div>
                    )}
                    
                    {selectedCourseDetails.questionCount && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedCourseDetails.questionCount} questions</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedCourseDetails.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedCourseDetails.description}
                    </p>
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
              <CardTitle className="text-base">Exam Guidelines</CardTitle>
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
              <CardTitle className="text-base">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you encounter any issues during the exam, please contact support.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}