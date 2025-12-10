"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Trophy,
  Users,
} from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface StudentSubmission {
  id: number
  studentId: number
  studentName?: string
  studentEmail?: string
  status: "in_progress" | "submitted" | "graded"
  totalScore: number
  percentage: number
  submittedAt?: string
  startedAt: string
  timeTakenMinutes: number
}

interface Exam {
  id: number
  name: string
  classId: number
  date: string
  totalQuestions: number
  totalMarks: number
}

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const examId = parseInt(params.id as string)

  const [exam, setExam] = useState<Exam | null>(null)
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load exam details
        try {
          const examData = await api.getMCQExamById(examId)
          console.log("Exam data received:", examData)
          if (!examData) {
            toast.error("Exam not found")
            router.push("/dashboard/exam")
            return
          }
          setExam(examData)
        } catch (examError: any) {
          console.error("Failed to load exam:", examError)
          toast.error(`Failed to load exam: ${examError.message || "Exam not found"}`)
          router.push("/dashboard/exam")
          return
        }

        // Load student submissions for this exam
        try {
          console.log("=== FETCHING EXAM SUBMISSIONS ===")
          console.log("Exam ID:", examId)
          console.log("API Endpoint:", `/exams/${examId}/submissions`)
          
          const submissionsData = await api.getExamSubmissions(examId)
          
          console.log("=== EXAM SUBMISSIONS DEBUG ===")
          console.log("Raw API Response:", JSON.stringify(submissionsData, null, 2))
          console.log("Response Type:", typeof submissionsData)
          console.log("Is Array:", Array.isArray(submissionsData))
          console.log("Is Null:", submissionsData === null)
          console.log("Is Undefined:", submissionsData === undefined)
          
          if (submissionsData) {
            console.log("Response Keys:", Object.keys(submissionsData))
            console.log("Response Values:", Object.values(submissionsData))
          }
          
          let submissionsList: any[] = []
          
          // Handle different response formats
          if (Array.isArray(submissionsData)) {
            console.log("✓ Response is direct array")
            submissionsList = submissionsData
          } else if (submissionsData && typeof submissionsData === 'object') {
            if (Array.isArray(submissionsData.data)) {
              console.log("✓ Found submissions in data property")
              submissionsList = submissionsData.data
            } else if (Array.isArray(submissionsData.submissions)) {
              console.log("✓ Found submissions in submissions property")
              submissionsList = submissionsData.submissions
            } else if (Array.isArray(submissionsData.result)) {
              console.log("✓ Found submissions in result property")
              submissionsList = submissionsData.result
            } else if (Array.isArray(submissionsData.items)) {
              console.log("✓ Found submissions in items property")
              submissionsList = submissionsData.items
            } else {
              console.warn("⚠ Response is object but no array found. Full response:", submissionsData)
              // Try to extract any array from the object
              const possibleArrays = Object.values(submissionsData).filter(Array.isArray)
              if (possibleArrays.length > 0) {
                console.log("Found possible array:", possibleArrays[0])
                submissionsList = possibleArrays[0] as any[]
              }
            }
          } else {
            console.warn("⚠ Unexpected response format:", submissionsData)
          }
          
          console.log("Processed Submissions List:", submissionsList)
          console.log("Number of submissions:", submissionsList.length)
          
          if (submissionsList.length === 0) {
            console.warn("⚠ No submissions found in response")
            console.warn("Full response structure:", submissionsData)
            toast.info("No submissions found. The API returned data but no submissions array was found. Check console for details.")
          }
          
          // If student names are missing, try to fetch them
          const submissionsWithNames = await Promise.all(
            submissionsList.map(async (submission: any, index: number) => {
              console.log(`Processing submission ${index + 1}:`, submission)
              
              // Handle different field name variations
              const studentId = submission.studentId || submission.student_id || submission.userId || submission.user_id
              const studentName = submission.studentName || submission.student_name || submission.name || submission.firstName
              
              console.log(`  Student ID: ${studentId}, Name: ${studentName}`)
              
              if (!studentName && studentId) {
                try {
                  console.log(`  Fetching student info for ID: ${studentId}`)
                  // Try to get student name from users/students table
                  const studentInfo = await api.getStudentInfo(studentId)
                  console.log(`  Fetched student info:`, studentInfo)
                  return {
                    ...submission,
                    studentId: studentId,
                    studentName: studentInfo?.name || studentInfo?.firstName || studentInfo?.student_name || `Student ${studentId}`,
                    studentEmail: studentInfo?.email || submission.studentEmail || submission.student_email
                  }
                } catch (error) {
                  console.warn(`  Could not fetch name for student ${studentId}:`, error)
                  return {
                    ...submission,
                    studentId: studentId,
                    studentName: `Student ${studentId}`
                  }
                }
              }
              
              return {
                ...submission,
                studentId: studentId,
                studentName: studentName || `Student ${studentId}`,
                studentEmail: submission.studentEmail || submission.student_email || submission.email
              }
            })
          )
          
          console.log("=== FINAL SUBMISSIONS ===")
          console.log("Final submissions with names:", submissionsWithNames)
          console.log("Total count:", submissionsWithNames.length)
          
          setSubmissions(submissionsWithNames)
          
          if (submissionsWithNames.length > 0) {
            toast.success(`Loaded ${submissionsWithNames.length} submission(s)`)
          }
        } catch (submissionError: any) {
          console.error("Failed to load submissions:", submissionError)
          console.error("Error status:", submissionError.status)
          console.error("Error message:", submissionError.message)
          
          // If endpoint doesn't exist yet (404) or no submissions, show empty list
          if (submissionError.status === 404 || 
              submissionError.message?.includes("404") || 
              submissionError.message?.includes("not found") ||
              submissionError.message?.includes("No submissions")) {
            toast.info("No submissions found for this exam yet. Students can submit their exams to see results here.")
            setSubmissions([])
          } else {
            // For other errors, show the error but don't block the page
            toast.error(`Failed to load submissions: ${submissionError.message || "Please ensure the backend API endpoint /exams/:examId/submissions is implemented"}`)
            setSubmissions([])
          }
        }
      } catch (error: any) {
        console.error("Failed to load results:", error)
        toast.error(`Failed to load exam results: ${error.message || "Unknown error"}`)
        // Don't redirect immediately, let user see the error
        setExam(null)
      } finally {
        setLoading(false)
      }
    }

    if (examId && !isNaN(examId)) {
      loadData()
    } else {
      toast.error("Invalid exam ID")
      router.push("/dashboard/exam")
    }
  }, [examId, router])

  const handleViewDetails = async (submission: StudentSubmission) => {
    try {
      // Load detailed submission with answers
      const details = await api.getStudentSubmissionDetails(submission.id)
      setSelectedSubmission({ ...submission, ...details })
      setViewDialogOpen(true)
    } catch (error) {
      console.error("Failed to load submission details:", error)
      toast.error("Failed to load submission details")
    }
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600" }
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600" }
    if (percentage >= 60) return { grade: "B", color: "text-blue-600" }
    if (percentage >= 50) return { grade: "C", color: "text-yellow-600" }
    return { grade: "F", color: "text-red-600" }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "graded":
        return <Badge className="bg-green-100 text-green-700">Graded</Badge>
      case "submitted":
        return <Badge className="bg-blue-100 text-blue-700">Submitted</Badge>
      case "in_progress":
        return <Badge className="bg-yellow-100 text-yellow-700">In Progress</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const submittedCount = submissions.filter((s) => s.status === "submitted" || s.status === "graded").length
  const averageScore = submissions.length > 0
    ? submissions
        .filter((s) => s.status === "graded")
        .reduce((sum, s) => sum + s.percentage, 0) / submissions.filter((s) => s.status === "graded").length
    : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
            <p className="text-muted-foreground mt-1">{exam.name}</p>
            <p className="text-sm text-muted-foreground">
              Class {exam.classId} • {format(new Date(exam.date), "MMM d, yyyy")} • {exam.totalQuestions} Questions • {exam.totalMarks} Marks
            </p>
          </div>
          <Link href="/dashboard/exam">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-5 w-5 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submissions.length}</div>
              <p className="text-xs text-muted-foreground">Registered in class</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{submittedCount}</div>
              <p className="text-xs text-muted-foreground">
                {submissions.length > 0 ? Math.round((submittedCount / submissions.length) * 100) : 0}% completion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Based on graded exams</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {submissions.filter((s) => s.status === "in_progress").length}
              </div>
              <p className="text-xs text-muted-foreground">Not yet submitted</p>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info (remove in production) */}
        {submissions.length === 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">Debug Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-yellow-800 space-y-2">
                <p><strong>No submissions found. Please check:</strong></p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Backend endpoint exists: <code className="bg-yellow-100 px-1 rounded">GET /api/exams/{examId}/submissions</code></li>
                  <li>Response includes student submissions array</li>
                  <li>Student "Jane Smith" has submitted exam ID {examId}</li>
                  <li>Check browser console (F12) for detailed API response</li>
                </ol>
              </div>
              <div className="pt-4 border-t border-yellow-300">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      console.log("=== MANUAL API TEST ===")
                      const testResponse = await api.getExamSubmissions(examId)
                      console.log("Test Response:", testResponse)
                      toast.success("Check console for API response")
                    } catch (error: any) {
                      console.error("Test Error:", error)
                      toast.error(`Error: ${error.message}`)
                    }
                  }}
                >
                  Test API Endpoint
                </Button>
                <p className="text-xs text-yellow-700 mt-2">
                  Click above to test the API endpoint and see the response in console
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Student Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Student Submissions</CardTitle>
            <CardDescription>
              View all student submissions and their scores
              {submissions.length > 0 && (
                <span className="ml-2 text-green-600">
                  ({submissions.length} submission{submissions.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader className="bg-gray-50 dark:bg-gray-900">
                  <TableRow>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Time Taken</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.length > 0 ? (
                    submissions.map((submission, index) => {
                      const grade = submission.status === "graded" || submission.status === "submitted"
                        ? getGrade(submission.percentage)
                        : null

                      return (
                        <TableRow
                          key={submission.id}
                          className={cn(
                            index % 2 === 0
                              ? "bg-white dark:bg-gray-800"
                              : "bg-gray-50 dark:bg-gray-900"
                          )}
                        >
                          <TableCell className="font-medium">
                            {submission.studentId}
                          </TableCell>
                          <TableCell>
                            {submission.studentName || submission.student_name || `Student ${submission.studentId}`}
                            {submission.studentEmail && (
                              <span className="text-xs text-muted-foreground block">
                                {submission.studentEmail}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>
                            {submission.status === "graded" || submission.status === "submitted" ? (
                              <span className="font-semibold">
                                {submission.totalScore.toFixed(1)} / {exam.totalMarks}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.status === "graded" || submission.status === "submitted" ? (
                              <span className="font-semibold">
                                {submission.percentage.toFixed(1)}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {grade ? (
                              <span className={cn("font-bold", grade.color)}>
                                {grade.grade}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.timeTakenMinutes > 0 ? (
                              <span>
                                {Math.floor(submission.timeTakenMinutes / 60)}h {submission.timeTakenMinutes % 60}m
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.submittedAt ? (
                              <span className="text-sm">
                                {format(new Date(submission.submittedAt), "MMM d, yyyy HH:mm")}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {(submission.status === "submitted" || submission.status === "graded") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewDetails(submission)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                        No submissions found for this exam.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* View Submission Details Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Submission Details - Student {selectedSubmission?.studentId}
              </DialogTitle>
              <DialogDescription>
                {selectedSubmission?.studentName || `Student ${selectedSubmission?.studentId}`}
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-2xl font-bold">
                      {selectedSubmission.totalScore.toFixed(1)} / {exam.totalMarks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Percentage</p>
                    <p className="text-2xl font-bold">{selectedSubmission.percentage.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <p className={cn("text-2xl font-bold", getGrade(selectedSubmission.percentage).color)}>
                      {getGrade(selectedSubmission.percentage).grade}
                    </p>
                  </div>
                </div>
                {/* Add detailed answer review here if needed */}
                <div className="text-sm text-muted-foreground">
                  Detailed answer review can be added here showing each question and student's answer.
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

