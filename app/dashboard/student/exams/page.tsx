"use client"

import { useEffect, useState, useRef } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table"
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Play,
} from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Exam {
  id: number
  name: string
  classId: number
  date: string
  totalQuestions: number
  totalMarks: number
}

interface ExamSubmission {
  examId: number
  status: "in_progress" | "submitted" | "graded"
  totalScore?: number
  percentage?: number
  submittedAt?: string
}

export default function StudentExamsPage() {
  const [exams, setExams] = useState<Exam[]>([])
  const [submissions, setSubmissions] = useState<Record<number, ExamSubmission>>({})
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState<number | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true

    const loadData = async () => {
      try {
        setLoading(true)
        
        // Get student ID from profile or localStorage
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const studentIdValue = user?.id || user?.studentId || 1 // Default to 1 for testing
        setStudentId(studentIdValue)

        // Fetch available exams
        const examsData = await api.getStudentExams(studentIdValue)
        setExams(Array.isArray(examsData) ? examsData : (examsData?.data || examsData?.exams || []))

        // Fetch student submissions
        const submissionsData = await api.getStudentExamSubmissions(studentIdValue)
        const submissionsMap: Record<number, ExamSubmission> = {}
        if (Array.isArray(submissionsData)) {
          submissionsData.forEach((sub: any) => {
            submissionsMap[sub.examId] = sub
          })
        }
        setSubmissions(submissionsMap)
      } catch (error) {
        console.error("Failed to load exams:", error)
        toast.error("Failed to load exams")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getExamStatus = (exam: Exam) => {
    const submission = submissions[exam.id]
    if (!submission) {
      return { status: "available", label: "Available", color: "bg-blue-100 text-blue-700" }
    }
    
    if (submission.status === "in_progress") {
      return { status: "in_progress", label: "In Progress", color: "bg-yellow-100 text-yellow-700" }
    }
    if (submission.status === "submitted") {
      return { status: "submitted", label: "Submitted", color: "bg-purple-100 text-purple-700" }
    }
    if (submission.status === "graded") {
      return { status: "graded", label: "Graded", color: "bg-green-100 text-green-700" }
    }
    return { status: "available", label: "Available", color: "bg-blue-100 text-blue-700" }
  }

  const canTakeExam = (exam: Exam) => {
    const submission = submissions[exam.id]
    return !submission || submission.status === "in_progress"
  }

  const canViewResult = (exam: Exam) => {
    const submission = submissions[exam.id]
    return submission && (submission.status === "submitted" || submission.status === "graded")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              My Exams
            </h1>
            <p className="text-muted-foreground mt-1">
              View and take your assigned MCQ exams
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
              <FileText className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exams.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Play className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {exams.filter((e) => !submissions[e.id] || submissions[e.id].status === "in_progress").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {exams.filter((e) => submissions[e.id]?.status === "submitted" || submissions[e.id]?.status === "graded").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Clock className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {(() => {
                  const gradedExams = exams.filter((e) => submissions[e.id]?.status === "graded")
                  if (gradedExams.length === 0) return "0%"
                  const avg = gradedExams.reduce((sum, e) => {
                    return sum + (submissions[e.id]?.percentage || 0)
                  }, 0) / gradedExams.length
                  return `${avg.toFixed(1)}%`
                })()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exams Table */}
        <Card>
          <CardHeader>
            <CardTitle>Available Exams</CardTitle>
            <CardDescription>
              Click on an exam to start or view results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.length > 0 ? (
                    exams.map((exam) => {
                      const examStatus = getExamStatus(exam)
                      const submission = submissions[exam.id]
                      
                      return (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>Class {exam.classId}</TableCell>
                          <TableCell>
                            {format(new Date(exam.date), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>{exam.totalQuestions}</TableCell>
                          <TableCell>{exam.totalMarks}</TableCell>
                          <TableCell>
                            <Badge className={examStatus.color}>
                              {examStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {submission?.status === "graded" ? (
                              <span className="font-semibold">
                                {submission.totalScore?.toFixed(1)} / {exam.totalMarks} ({submission.percentage?.toFixed(1)}%)
                              </span>
                            ) : submission?.status === "submitted" ? (
                              <span className="text-muted-foreground">Pending</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {canTakeExam(exam) && (
                                <Link href={`/dashboard/student/exams/take/${exam.id}`}>
                                  <Button size="sm" variant="default">
                                    <Play className="h-4 w-4 mr-1" />
                                    {submission?.status === "in_progress" ? "Continue" : "Start"}
                                  </Button>
                                </Link>
                              )}
                              {canViewResult(exam) && (
                                <Link href={`/dashboard/student/exams/result/${exam.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-4 w-4 mr-1" />
                                    View Result
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                        No exams available at the moment.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

