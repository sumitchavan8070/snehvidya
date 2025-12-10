"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  List,
  CalendarDays,
  Search,
  Plus,
  FileText,
  Eye,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Trophy,
} from "lucide-react"
import Link from "next/link"
import { api } from "@/lib/api"

// Interface for MCQ Question
interface MCQQuestion {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: "A" | "B" | "C" | "D"
  marks: number
}

// Interface for MCQ Exam
interface MCQExam {
  id: number
  name: string
  classId: number
  date: string
  totalQuestions: number
  totalMarks: number
  questions: MCQQuestion[]
  createdAt?: string
}

export default function ExamManagement() {
  const [viewMode, setViewMode] = useState<"list" | "create">("list")
  const [exams, setExams] = useState<MCQExam[]>([])
  const [filteredExams, setFilteredExams] = useState<MCQExam[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedExam, setSelectedExam] = useState<MCQExam | null>(null)

  // Exam Form State
  const [examForm, setExamForm] = useState({
    name: "",
    classId: "",
    date: new Date(),
    totalQuestions: 20,
    totalMarks: 100,
  })

  // Questions State
  const [questions, setQuestions] = useState<MCQQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  // Apply filters
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...exams]
      if (searchQuery) {
        filtered = filtered.filter(
          (exam) =>
            exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.classId.toString().includes(searchQuery.toLowerCase())
        )
      }
      setFilteredExams(filtered)
    }
    applyFilters()
  }, [exams, searchQuery])

  // Initialize questions when totalQuestions changes
  useEffect(() => {
    if (viewMode === "create" && examForm.totalQuestions > 0) {
      const newQuestions: MCQQuestion[] = Array.from(
        { length: examForm.totalQuestions },
        (_, index) => ({
          id: index + 1,
          question: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
          marks: Math.floor(examForm.totalMarks / examForm.totalQuestions),
        })
      )
      setQuestions(newQuestions)
      setCurrentQuestionIndex(0)
    }
  }, [examForm.totalQuestions, examForm.totalMarks, viewMode])

  // Handle exam form changes
  const handleExamFormChange = (field: string, value: any) => {
    setExamForm((prev) => ({ ...prev, [field]: value }))
  }

  // Handle question changes
  const handleQuestionChange = (index: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    )
  }

  // Navigate to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // Navigate to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // Jump to specific question
  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  // Load exams on mount
  const hasLoadedExamsRef = useRef(false)
  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasLoadedExamsRef.current && viewMode === "list") {
      return
    }

    const loadExams = async () => {
      try {
        setLoading(true)
        const data = await api.getMCQExams()
        setExams(Array.isArray(data) ? data : (data?.data || data?.exams || []))
      } catch (error) {
        console.error("Failed to load exams:", error)
        // If API fails, use empty array (for development)
        setExams([])
      } finally {
        setLoading(false)
      }
    }
    if (viewMode === "list") {
      hasLoadedExamsRef.current = true
      loadExams()
    } else {
      hasLoadedExamsRef.current = false
    }
  }, [viewMode])

  // Validate and save exam
  const handleSaveExam = async () => {
    // Validate exam form
    if (!examForm.name || !examForm.classId || !examForm.date) {
      toast.error("Please fill in all exam details")
      return
    }

    // Validate all questions
    const invalidQuestions = questions.filter(
      (q) =>
        !q.question ||
        !q.optionA ||
        !q.optionB ||
        !q.optionC ||
        !q.optionD
    )

    if (invalidQuestions.length > 0) {
      toast.error(
        `Please fill in all fields for question(s): ${invalidQuestions.map((q) => q.id).join(", ")}`
      )
      return
    }

    setLoading(true)
    try {
      const newExam: MCQExam = {
        id: exams.length + 1,
        name: examForm.name,
        classId: Number(examForm.classId),
        date: format(examForm.date, "yyyy-MM-dd"),
        totalQuestions: examForm.totalQuestions,
        totalMarks: examForm.totalMarks,
        questions: questions,
        createdAt: new Date().toISOString(),
      }

      // Call API to save exam
      await api.createMCQExam(newExam)

      setExams([...exams, newExam])
      toast.success("MCQ Exam created successfully!")
      
      // Reset form
      setExamForm({
        name: "",
        classId: "",
        date: new Date(),
        totalQuestions: 20,
        totalMarks: 100,
      })
      setQuestions([])
      setViewMode("list")
    } catch (error) {
      toast.error("Failed to create exam")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle view exam
  const handleViewExam = (exam: MCQExam) => {
    setSelectedExam(exam)
    setViewDialogOpen(true)
  }

  // Handle delete exam
  const handleDeleteExam = async (examId: number) => {
    if (confirm("Are you sure you want to delete this exam?")) {
      try {
        await api.deleteMCQExam(examId)
        setExams(exams.filter((exam) => exam.id !== examId))
        toast.success("Exam deleted successfully")
      } catch (error) {
        toast.error("Failed to delete exam")
        console.error(error)
      }
    }
  }

  // Calculate stats
  const totalExams = exams.length
  const upcomingExams = exams.filter(
    (exam) => new Date(exam.date) > new Date()
  ).length

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              MCQ Exam Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage multiple choice question exams
            </p>
          </div>
          {viewMode === "list" && (
            <Button
              onClick={() => setViewMode("create")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create MCQ Exam
            </Button>
          )}
          {viewMode === "create" && (
            <Button
              onClick={() => {
                setViewMode("list")
                setExamForm({
                  name: "",
                  classId: "",
                  date: new Date(),
                  totalQuestions: 20,
                  totalMarks: 100,
                })
                setQuestions([])
              }}
              variant="outline"
            >
              Back to List
            </Button>
          )}
        </div>

        {viewMode === "list" ? (
          <>
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Exams
                  </CardTitle>
                  <List className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {totalExams}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Upcoming Exams
                  </CardTitle>
                  <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {upcomingExams}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exams scheduled in the future
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Questions
                  </CardTitle>
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {exams.reduce((sum, exam) => sum + exam.totalQuestions, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Marks
                  </CardTitle>
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {exams.reduce((sum, exam) => sum + exam.totalMarks, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div className="relative w-full sm:w-[350px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search by name or class ID..."
                  className="pl-10 w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Exams Table Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <Table>
                  <TableHeader className="bg-gray-50 dark:bg-gray-900">
                    <TableRow className="border-b border-gray-200 dark:border-gray-700">
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Exam Name
                      </TableHead>
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Class ID
                      </TableHead>
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Date
                      </TableHead>
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Questions
                      </TableHead>
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Total Marks
                      </TableHead>
                      <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExams.length > 0 ? (
                      filteredExams.map((exam, index) => (
                        <TableRow
                          key={exam.id}
                          className={cn(
                            "transition-colors",
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-900",
                            "hover:bg-gray-100 dark:hover:bg-gray-700"
                          )}
                        >
                          <TableCell className="py-3 text-gray-800 dark:text-gray-200 font-medium">
                            {exam.name}
                          </TableCell>
                          <TableCell className="py-3 text-gray-800 dark:text-gray-200">
                            Class {exam.classId}
                          </TableCell>
                          <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                            {format(new Date(exam.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="py-3 text-gray-800 dark:text-gray-200">
                            {exam.totalQuestions}
                          </TableCell>
                          <TableCell className="py-3 text-gray-800 dark:text-gray-200">
                            {exam.totalMarks}
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewExam(exam)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Link href={`/dashboard/exam/results/${exam.id}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Trophy className="h-4 w-4 mr-1" />
                                  Results
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteExam(exam.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-gray-500 py-8"
                        >
                          No exams found. Create your first MCQ exam!
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : (
          /* Create Exam Mode */
          <div className="space-y-6">
            {/* Exam Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Exam Details</CardTitle>
                <CardDescription>
                  Fill in the basic information for your MCQ exam
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="examName">Exam Name *</Label>
                    <Input
                      id="examName"
                      placeholder="e.g., Mathematics Mid-Term Exam"
                      value={examForm.name}
                      onChange={(e) =>
                        handleExamFormChange("name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class ID *</Label>
                    <Input
                      id="classId"
                      type="number"
                      placeholder="e.g., 1"
                      value={examForm.classId}
                      onChange={(e) =>
                        handleExamFormChange("classId", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalQuestions">Total Questions *</Label>
                    <Input
                      id="totalQuestions"
                      type="number"
                      min="1"
                      placeholder="e.g., 20"
                      value={examForm.totalQuestions}
                      onChange={(e) =>
                        handleExamFormChange(
                          "totalQuestions",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalMarks">Total Marks *</Label>
                    <Input
                      id="totalMarks"
                      type="number"
                      min="1"
                      placeholder="e.g., 100"
                      value={examForm.totalMarks}
                      onChange={(e) =>
                        handleExamFormChange(
                          "totalMarks",
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="examDate">Exam Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !examForm.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          {examForm.date
                            ? format(examForm.date, "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50">
                        <Calendar
                          mode="single"
                          selected={examForm.date}
                          onSelect={(date) =>
                            date && handleExamFormChange("date", date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Questions Builder Card */}
            {questions.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>
                        Question {currentQuestionIndex + 1} of{" "}
                        {questions.length}
                      </CardTitle>
                      <CardDescription>
                        Fill in the question and all 4 options, then select the
                        correct answer
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextQuestion}
                        disabled={currentQuestionIndex === questions.length - 1}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Question Navigation */}
                  <div className="flex flex-wrap gap-2">
                    {questions.map((q, index) => (
                      <Button
                        key={q.id}
                        variant={
                          index === currentQuestionIndex
                            ? "default"
                            : q.question &&
                              q.optionA &&
                              q.optionB &&
                              q.optionC &&
                              q.optionD
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleJumpToQuestion(index)}
                        className="w-10 h-10 p-0"
                      >
                        {index + 1}
                      </Button>
                    ))}
                  </div>

                  {/* Current Question Form */}
                  {currentQuestion && (
                    <div className="space-y-4 border-t pt-6">
                      <div className="space-y-2">
                        <Label htmlFor="question">
                          Question {currentQuestion.id} *
                        </Label>
                        <Textarea
                          id="question"
                          placeholder="Enter your question here..."
                          value={currentQuestion.question}
                          onChange={(e) =>
                            handleQuestionChange(
                              currentQuestionIndex,
                              "question",
                              e.target.value
                            )
                          }
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="optionA">Option A *</Label>
                          <Input
                            id="optionA"
                            placeholder="Enter option A"
                            value={currentQuestion.optionA}
                            onChange={(e) =>
                              handleQuestionChange(
                                currentQuestionIndex,
                                "optionA",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionB">Option B *</Label>
                          <Input
                            id="optionB"
                            placeholder="Enter option B"
                            value={currentQuestion.optionB}
                            onChange={(e) =>
                              handleQuestionChange(
                                currentQuestionIndex,
                                "optionB",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionC">Option C *</Label>
                          <Input
                            id="optionC"
                            placeholder="Enter option C"
                            value={currentQuestion.optionC}
                            onChange={(e) =>
                              handleQuestionChange(
                                currentQuestionIndex,
                                "optionC",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="optionD">Option D *</Label>
                          <Input
                            id="optionD"
                            placeholder="Enter option D"
                            value={currentQuestion.optionD}
                            onChange={(e) =>
                              handleQuestionChange(
                                currentQuestionIndex,
                                "optionD",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Correct Answer *</Label>
                        <RadioGroup
                          value={currentQuestion.correctAnswer}
                          onValueChange={(value: "A" | "B" | "C" | "D") =>
                            handleQuestionChange(
                              currentQuestionIndex,
                              "correctAnswer",
                              value
                            )
                          }
                          className="flex flex-row gap-6"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="A" id="correctA" />
                            <Label htmlFor="correctA">Option A</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="B" id="correctB" />
                            <Label htmlFor="correctB">Option B</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="C" id="correctC" />
                            <Label htmlFor="correctC">Option C</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="D" id="correctD" />
                            <Label htmlFor="correctD">Option D</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="marks">Marks for this question</Label>
                        <Input
                          id="marks"
                          type="number"
                          min="1"
                          value={currentQuestion.marks}
                          onChange={(e) =>
                            handleQuestionChange(
                              currentQuestionIndex,
                              "marks",
                              Number(e.target.value)
                            )
                          }
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setViewMode("list")
                  setExamForm({
                    name: "",
                    classId: "",
                    date: new Date(),
                    totalQuestions: 20,
                    totalMarks: 100,
                  })
                  setQuestions([])
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveExam}
                disabled={loading || questions.length === 0}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? "Saving..." : "Save MCQ Exam"}
              </Button>
            </div>
          </div>
        )}

        {/* View Exam Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedExam?.name}</DialogTitle>
              <DialogDescription>
                Class {selectedExam?.classId} •{" "}
                {selectedExam?.date &&
                  format(new Date(selectedExam.date), "MMM d, yyyy")}{" "}
                • {selectedExam?.totalQuestions} Questions •{" "}
                {selectedExam?.totalMarks} Marks
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              {selectedExam?.questions.map((question, index) => (
                <Card key={question.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-lg">
                          Q{index + 1}: {question.question}
                        </p>
                        <span className="text-sm text-muted-foreground">
                          {question.marks} marks
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          className={cn(
                            "p-3 border rounded",
                            question.correctAnswer === "A" &&
                              "bg-green-50 border-green-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">A.</span>
                            <span>{question.optionA}</span>
                            {question.correctAnswer === "A" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "p-3 border rounded",
                            question.correctAnswer === "B" &&
                              "bg-green-50 border-green-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">B.</span>
                            <span>{question.optionB}</span>
                            {question.correctAnswer === "B" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "p-3 border rounded",
                            question.correctAnswer === "C" &&
                              "bg-green-50 border-green-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">C.</span>
                            <span>{question.optionC}</span>
                            {question.correctAnswer === "C" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "p-3 border rounded",
                            question.correctAnswer === "D" &&
                              "bg-green-50 border-green-500"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-medium">D.</span>
                            <span>{question.optionD}</span>
                            {question.correctAnswer === "D" && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
