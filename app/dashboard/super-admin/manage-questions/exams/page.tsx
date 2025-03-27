"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { v4 as uuidv4 } from "uuid"
import {
  Plus,
  Trash2,
  Edit,
  Save,
  List,
  AlertCircle,
  CheckCircle,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  MoreHorizontal,
  FileText,
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast";

// Define the schema for exam form validation
const examSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  courseId: z.string().min(1, "Course is required"),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  passingScore: z.number().min(0, "Passing score must be at least 0").max(100, "Passing score cannot exceed 100"),
  shuffleQuestions: z.boolean().default(false),
  showResults: z.boolean().default(true),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
})

// Define types for our data structures
type Option = {
  id: string
  text: string
  isCorrect: boolean
}

type Question = {
  id: string
  text: string
  type: "multiple-choice" | "single-choice"
  options: Option[]
  points: number
}

type Exam = {
  id: string
  title: string
  description: string
  courseId: string
  courseName: string
  duration: number
  passingScore: number
  shuffleQuestions: boolean
  showResults: boolean
  questions: Question[]
  createdAt: string
  scheduledDate?: string
  scheduledTime?: string
  status: "draft" | "published" | "scheduled"
}

type Course = {
  id: string
  name: string
  code: string
}

export default function QuestionBuilderPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("view-exams")
  const [exams, setExams] = useState<Exam[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentExam, setCurrentExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [courseFilter, setCourseFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [csvData, setCsvData] = useState("")
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [examToDelete, setExamToDelete] = useState<string | null>(null)

  // Form setup
  const form = useForm<z.infer<typeof examSchema>>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: "",
      description: "",
      courseId: "",
      duration: 60,
      passingScore: 60,
      shuffleQuestions: false,
      showResults: true,
    },
  })

  // Mock data loading
  useEffect(() => {
    // Simulate API call to fetch courses
    const fetchCourses = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setCourses([
          { id: "course1", name: "Introduction to Computer Science", code: "CS101" },
          { id: "course2", name: "Data Structures and Algorithms", code: "CS201" },
          { id: "course3", name: "Database Systems", code: "CS301" },
          { id: "course4", name: "Web Development", code: "CS401" },
        ])
      }, 500)
    }

    // Simulate API call to fetch exams
    const fetchExams = async () => {
      // In a real app, this would be an API call
      setTimeout(() => {
        setExams([
          {
            id: "exam1",
            title: "Midterm Examination",
            description: "Covers topics from weeks 1-6 of the course",
            courseId: "course1",
            courseName: "Introduction to Computer Science",
            duration: 90,
            passingScore: 60,
            shuffleQuestions: true,
            showResults: true,
            questions: [
              {
                id: "q1",
                text: "What is the time complexity of binary search?",
                type: "single-choice",
                options: [
                  { id: "o1", text: "O(1)", isCorrect: false },
                  { id: "o2", text: "O(log n)", isCorrect: true },
                  { id: "o3", text: "O(n)", isCorrect: false },
                  { id: "o4", text: "O(n log n)", isCorrect: false },
                ],
                points: 5,
              },
              {
                id: "q2",
                text: "Which of the following are valid data types in JavaScript?",
                type: "multiple-choice",
                options: [
                  { id: "o1", text: "String", isCorrect: true },
                  { id: "o2", text: "Number", isCorrect: true },
                  { id: "o3", text: "Boolean", isCorrect: true },
                  { id: "o4", text: "Character", isCorrect: false },
                ],
                points: 5,
              },
            ],
            createdAt: "2023-05-15T10:30:00Z",
            status: "published",
          },
          {
            id: "exam2",
            title: "Final Examination",
            description: "Comprehensive exam covering all course material",
            courseId: "course2",
            courseName: "Data Structures and Algorithms",
            duration: 120,
            passingScore: 70,
            shuffleQuestions: true,
            showResults: false,
            questions: [
              {
                id: "q1",
                text: "What data structure would be most efficient for implementing a priority queue?",
                type: "single-choice",
                options: [
                  { id: "o1", text: "Array", isCorrect: false },
                  { id: "o2", text: "Linked List", isCorrect: false },
                  { id: "o3", text: "Heap", isCorrect: true },
                  { id: "o4", text: "Stack", isCorrect: false },
                ],
                points: 10,
              },
            ],
            createdAt: "2023-06-20T14:00:00Z",
            scheduledDate: "2023-07-15",
            scheduledTime: "10:00",
            status: "scheduled",
          },
        ])
        setLoading(false)
      }, 1000)
    }

    fetchCourses()
    fetchExams()
  }, [])

  // Filter exams based on search term and filters
  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = courseFilter ? exam.courseId === courseFilter : true
    const matchesStatus = statusFilter ? exam.status === statusFilter : true

    return matchesSearch && matchesCourse && matchesStatus
  })

  // Create a new question
  const createQuestion = () => {
    const newQuestion: Question = {
      id: uuidv4(),
      text: "",
      type: "single-choice",
      options: [
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
        { id: uuidv4(), text: "", isCorrect: false },
      ],
      points: 1,
    }

    setCurrentQuestion(newQuestion)
    setIsEditingQuestion(true)
  }

  // Add option to current question
  const addOption = () => {
    if (!currentQuestion) return

    setCurrentQuestion({
      ...currentQuestion,
      options: [...currentQuestion.options, { id: uuidv4(), text: "", isCorrect: false }],
    })
  }

  // Remove option from current question
  const removeOption = (optionId: string) => {
    if (!currentQuestion) return

    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.filter((option) => option.id !== optionId),
    })
  }

  // Update option text
  const updateOptionText = (optionId: string, text: string) => {
    if (!currentQuestion) return

    setCurrentQuestion({
      ...currentQuestion,
      options: currentQuestion.options.map((option) => (option.id === optionId ? { ...option, text } : option)),
    })
  }

  // Toggle option correctness
  const toggleOptionCorrect = (optionId: string) => {
    if (!currentQuestion) return

    if (currentQuestion.type === "single-choice") {
      // For single choice, only one option can be correct
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.map((option) =>
          option.id === optionId ? { ...option, isCorrect: true } : { ...option, isCorrect: false },
        ),
      })
    } else {
      // For multiple choice, toggle the current option
      setCurrentQuestion({
        ...currentQuestion,
        options: currentQuestion.options.map((option) =>
          option.id === optionId ? { ...option, isCorrect: !option.isCorrect } : option,
        ),
      })
    }
  }

  // Save current question
  const saveQuestion = () => {
    if (!currentQuestion || !currentQuestion.text.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      })
      return
    }

    // Validate that at least one option is marked as correct
    if (!currentQuestion.options.some((option) => option.isCorrect)) {
      toast({
        title: "Error",
        description: "At least one option must be marked as correct",
        variant: "destructive",
      })
      return
    }

    // Validate that all options have text
    if (currentQuestion.options.some((option) => !option.text.trim())) {
      toast({
        title: "Error",
        description: "All options must have text",
        variant: "destructive",
      })
      return
    }

    if (isEditingQuestion) {
      // Update existing question
      setQuestions(questions.map((q) => (q.id === currentQuestion.id ? currentQuestion : q)))
    } else {
      // Add new question
      setQuestions([...questions, currentQuestion])
    }

    setCurrentQuestion(null)
    setIsEditingQuestion(false)

    toast({
      title: "Success",
      description: isEditingQuestion ? "Question updated successfully" : "Question added successfully",
    })
  }

  // Edit existing question
  const editQuestion = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId)
    if (question) {
      setCurrentQuestion(question)
      setIsEditingQuestion(true)
    }
  }

  // Delete question
  const deleteQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
    toast({
      title: "Success",
      description: "Question deleted successfully",
    })
  }

  // Handle CSV import
  const handleCsvImport = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "CSV data is required",
        variant: "destructive",
      })
      return
    }

    try {
      // Parse CSV data (simplified for this example)
      const lines = csvData.trim().split("\n")
      const importedQuestions: Question[] = []

      for (let i = 1; i < lines.length; i++) {
        // Skip header row
        const columns = lines[i].split(",")

        if (columns.length < 3) continue // Skip invalid rows

        const questionText = columns[0].trim()
        const questionType = columns[1].trim() === "multiple" ? "multiple-choice" : "single-choice"
        const points = Number.parseInt(columns[2].trim()) || 1

        const options: Option[] = []
        // const correctIndices: number[] = []

        // Parse options and correct answers
        for (let j = 3; j < columns.length; j++) {
          if (columns[j].trim().startsWith("*")) {
            // This is a correct option
            options.push({
              id: uuidv4(),
              text: columns[j].trim().substring(1),
              isCorrect: true,
            })
          } else if (columns[j].trim()) {
            // This is a regular option
            options.push({
              id: uuidv4(),
              text: columns[j].trim(),
              isCorrect: false,
            })
          }
        }

        if (options.length > 0) {
          importedQuestions.push({
            id: uuidv4(),
            text: questionText,
            type: questionType,
            options,
            points,
          })
        }
      }

      if (importedQuestions.length === 0) {
        toast({
          title: "Error",
          description: "No valid questions found in CSV data",
          variant: "destructive",
        })
        return
      }

      setQuestions([...questions, ...importedQuestions])
      setIsImporting(false)
      setCsvData("")

      toast({
        title: "Success",
        description: `Imported ${importedQuestions.length} questions successfully`,
      })
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive",
      })
    }
  }

  // Create or update exam
  const saveExam = async (data: z.infer<typeof examSchema>) => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "At least one question is required",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      // Prepare exam data
      const examData = {
        ...data,
        questions,
        id: currentExam?.id || uuidv4(),
        courseName: courses.find((c) => c.id === data.courseId)?.name || "",
        createdAt: currentExam?.createdAt || new Date().toISOString(),
        status: data.scheduledDate && data.scheduledTime ? "scheduled" : "published",
      }

      // In a real app, this would be an API call
      setTimeout(() => {
        if (currentExam) {
          // Update existing exam
          setExams(exams.map((e) => (e.id === currentExam.id ? (examData as Exam) : e)))
          toast({
            title: "Success",
            description: "Exam updated successfully",
          })
        } else {
          // Create new exam
          setExams([...exams, examData as Exam])
          toast({
            title: "Success",
            description: "Exam created successfully",
          })
        }

        setSaving(false)
        setCurrentExam(null)
        setQuestions([])
        form.reset()
        setActiveTab("view-exams")
      }, 1000)
    } catch (error) {
      console.log(error)
      toast({
        title: "Error",
        description: "Failed to save exam",
        variant: "destructive",
      })
      setSaving(false)
    }
  }

  // Edit existing exam
  const editExam = (examId: string) => {
    const exam = exams.find((e) => e.id === examId)
    if (exam) {
      setCurrentExam(exam)
      setQuestions(exam.questions)

      form.reset({
        title: exam.title,
        description: exam.description,
        courseId: exam.courseId,
        duration: exam.duration,
        passingScore: exam.passingScore,
        shuffleQuestions: exam.shuffleQuestions,
        showResults: exam.showResults,
        scheduledDate: exam.scheduledDate || "",
        scheduledTime: exam.scheduledTime || "",
      })

      setActiveTab("create-exam")
    }
  }

  // Delete exam
  const confirmDeleteExam = () => {
    if (!examToDelete) return

    setExams(exams.filter((e) => e.id !== examToDelete))
    setExamToDelete(null)
    setDeleteDialogOpen(false)

    toast({
      title: "Success",
      description: "Exam deleted successfully",
    })
  }

  // Reset form and state for new exam
  const startNewExam = () => {
    setCurrentExam(null)
    setQuestions([])
    form.reset({
      title: "",
      description: "",
      courseId: "",
      duration: 60,
      passingScore: 60,
      shuffleQuestions: false,
      showResults: true,
      scheduledDate: "",
      scheduledTime: "",
    })
    setActiveTab("create-exam")
  }

  // Download exam as JSON
  const downloadExamJson = (examId: string) => {
    const exam = exams.find((e) => e.id === examId)
    if (!exam) return

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exam, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `exam_${exam.id}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Builder</h1>
          <p className="text-muted-foreground">Create and manage exams for your courses</p>
        </div>
        <Button onClick={startNewExam}>
          <Plus className="mr-2 h-4 w-4" /> Create New Exam
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view-exams" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span>View Exams</span>
          </TabsTrigger>
          <TabsTrigger value="create-exam" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>{currentExam ? "Edit Exam" : "Create Exam"}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view-exams" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Management</CardTitle>
              <CardDescription>View, edit, and manage your exams</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Search and filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={courseFilter} onValueChange={setCourseFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by course" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Courses</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filter by status" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setCourseFilter("")
                    setStatusFilter("")
                  }}
                  className="w-full sm:w-auto"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset
                </Button>
              </div>

              {/* Exams table */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading exams...</p>
                </div>
              ) : filteredExams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Exams Found</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    {searchTerm || courseFilter || statusFilter
                      ? "Try adjusting your search or filter criteria."
                      : "You haven't created any exams yet. Click 'Create New Exam' to get started."}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead className="hidden md:table-cell">Course</TableHead>
                        <TableHead className="hidden md:table-cell">Questions</TableHead>
                        <TableHead className="hidden md:table-cell">Duration</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredExams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell>
                            <div className="font-medium">{exam.title}</div>
                            <div className="text-sm text-muted-foreground md:hidden">{exam.courseName}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{exam.courseName}</TableCell>
                          <TableCell className="hidden md:table-cell">{exam.questions.length}</TableCell>
                          <TableCell className="hidden md:table-cell">{exam.duration} min</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                exam.status === "published"
                                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                                  : exam.status === "scheduled"
                                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                    : "bg-amber-100 text-amber-800 hover:bg-amber-100"
                              }
                            >
                              {exam.status === "published"
                                ? "Published"
                                : exam.status === "scheduled"
                                  ? "Scheduled"
                                  : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Open menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => editExam(exam.id)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => downloadExamJson(exam.id)}>
                                  <Download className="mr-2 h-4 w-4" />
                                  <span>Download JSON</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    setExamToDelete(exam.id)
                                    setDeleteDialogOpen(true)
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Delete</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-exam" className="space-y-6">
          <form onSubmit={form.handleSubmit(saveExam)}>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Exam details */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Exam Details</CardTitle>
                  <CardDescription>Basic information about the exam</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Exam Title</Label>
                      <Input id="title" placeholder="Enter exam title" {...form.register("title")} />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="courseId">Course</Label>
                      <Select
                        value={form.watch("courseId")}
                        onValueChange={(value) => form.setValue("courseId", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.courseId && (
                        <p className="text-sm text-destructive">{form.formState.errors.courseId.message}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" placeholder="Enter exam description" {...form.register("description")} />
                    {form.formState.errors.description && (
                      <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input id="duration" type="number" {...form.register("duration", { valueAsNumber: true })} />
                      {form.formState.errors.duration && (
                        <p className="text-sm text-destructive">{form.formState.errors.duration.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        {...form.register("passingScore", { valueAsNumber: true })}
                      />
                      {form.formState.errors.passingScore && (
                        <p className="text-sm text-destructive">{form.formState.errors.passingScore.message}</p>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="shuffleQuestions"
                          checked={form.watch("shuffleQuestions")}
                          onCheckedChange={(value) => form.setValue("shuffleQuestions", value)}
                        />
                        <Label htmlFor="shuffleQuestions">Shuffle Questions</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="showResults"
                          checked={form.watch("showResults")}
                          onCheckedChange={(value) => form.setValue("showResults", value)}
                        />
                        <Label htmlFor="showResults">Show Results to Students</Label>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="scheduledDate">Scheduled Date (Optional)</Label>
                      <Input id="scheduledDate" type="date" {...form.register("scheduledDate")} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scheduledTime">Scheduled Time (Optional)</Label>
                      <Input id="scheduledTime" type="time" {...form.register("scheduledTime")} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Questions section */}
              <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>Add or import questions for this exam</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsImporting(true)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Import CSV
                    </Button>
                    <Button type="button" onClick={createQuestion}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-md">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No Questions Added</h3>
                      <p className="text-muted-foreground max-w-md mt-2">
                        Click &apos;Add Question&apos; to create a new question or &apos;Import CSV&apos; to import questions from a CSV
                        file.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions.map((question, index) => (
                        <Card key={question.id}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                Q{index + 1}
                              </Badge>
                              <CardTitle className="text-base">{question.text}</CardTitle>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant="outline">
                                {question.type === "single-choice" ? "Single Choice" : "Multiple Choice"}
                              </Badge>
                              <Badge variant="outline">
                                {question.points} {question.points === 1 ? "point" : "points"}
                              </Badge>
                              <Button variant="ghost" size="icon" onClick={() => editQuestion(question.id)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => deleteQuestion(question.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {question.options.map((option) => (
                                <div key={option.id} className="flex items-center space-x-2">
                                  {option.isCorrect ? (
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <span>{option.text}</span>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setActiveTab("view-exams")}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {currentExam ? "Update Exam" : "Create Exam"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Question editor dialog */}
      <Dialog open={!!currentQuestion} onOpenChange={(open) => !open && setCurrentQuestion(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditingQuestion ? "Edit Question" : "Add Question"}</DialogTitle>
            <DialogDescription>
              {isEditingQuestion ? "Edit the question details and options" : "Create a new question for your exam"}
            </DialogDescription>
          </DialogHeader>

          {currentQuestion && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text</Label>
                <Textarea
                  id="questionText"
                  placeholder="Enter your question"
                  value={currentQuestion.text}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="questionType">Question Type</Label>
                  <Select
                    value={currentQuestion.type}
                    onValueChange={(value: "single-choice" | "multiple-choice") =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        type: value,
                        // Reset correct answers if changing from multiple to single
                        options:
                          value === "single-choice"
                            ? currentQuestion.options.map((o, i) => ({ ...o, isCorrect: i === 0 }))
                            : currentQuestion.options,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single-choice">Single Choice</SelectItem>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={currentQuestion.points}
                    onChange={(e) =>
                      setCurrentQuestion({
                        ...currentQuestion,
                        points: Number.parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Options</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addOption}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Option
                  </Button>
                </div>

                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      {currentQuestion.type === "single-choice" ? (
                        <RadioGroup
                          value={currentQuestion.options.findIndex((o) => o.isCorrect).toString()}
                          onValueChange={(value) => {
                            const optionIndex = Number.parseInt(value)
                            toggleOptionCorrect(currentQuestion.options[optionIndex].id)
                          }}
                        >
                          <RadioGroupItem
                            value={index.toString()}
                            id={`option-${option.id}`}
                            checked={option.isCorrect}
                          />
                        </RadioGroup>
                      ) : (
                        <Checkbox
                          id={`option-${option.id}`}
                          checked={option.isCorrect}
                          onCheckedChange={() => toggleOptionCorrect(option.id)}
                        />
                      )}
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updateOptionText(option.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(option.id)}
                        disabled={currentQuestion.options.length <= 2}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCurrentQuestion(null)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveQuestion}>
              {isEditingQuestion ? "Update Question" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV import dialog */}
      <Dialog open={isImporting} onOpenChange={setIsImporting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Questions from CSV</DialogTitle>
            <DialogDescription>
              Paste your CSV data below. The format should be:
              <code className="block mt-2 p-2 bg-muted rounded-md text-xs">
                Question,Type,Points,Option1,Option2,Option3,...
                <br />
                &quot;What is 2+2?&quot;,single,5,*4,3,5,6
                <br />
                &quot;Select all prime numbers&quot;,multiple,10,*2,*3,4,*5,6
              </code>
              <span className="block mt-2 text-xs">Note: Mark correct options with an asterisk (*).</span>
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Paste your CSV data here..."
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            className="min-h-[200px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImporting(false)}>
              Cancel
            </Button>
            <Button onClick={handleCsvImport}>
              <Upload className="mr-2 h-4 w-4" />
              Import Questions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this exam? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteExam}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Exam
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

