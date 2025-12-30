"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Question {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: "A" | "B" | "C" | "D"
  marks: number
}

interface Answer {
  questionId: number
  studentAnswer: "A" | "B" | "C" | "D" | null
  isCorrect: boolean
  marksObtained: number
}

interface Exam {
  id: number
  name: string
  classId: number
  date: string
  totalQuestions: number
  totalMarks: number
  questions: Question[]
}

interface Submission {
  id: number
  totalScore: number
  percentage: number
  submittedAt: string
  timeTakenMinutes: number
}

export default function ExamResultPage() {
  const params = useParams()
  const router = useRouter()
  const examId = parseInt(params.id as string)

  const [exam, setExam] = useState<Exam | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState<number | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const studentIdValue = user?.id || user?.studentId || 1
        setStudentId(studentIdValue)

        // Load exam
        const examData = await api.getMCQExamById(examId)
        setExam(examData)

        // Load submission
        const submissionData = await api.getStudentExamSubmission(studentIdValue, examId)
        if (!submissionData) {
          router.push("/dashboard/student/exams")
          return
        }
        setSubmission(submissionData)

        // Load answers
        const answersData = await api.getStudentExamAnswers(submissionData.id)
        const answersMap: Record<number, Answer> = {}
        answersData.forEach((answer: any) => {
          answersMap[answer.questionId] = answer
        })
        setAnswers(answersMap)
      } catch (error) {
        console.error("Failed to load result:", error)
        router.push("/dashboard/student/exams")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      loadData()
    }
  }, [examId, router])

  if (loading || !exam || !submission) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return { grade: "A+", color: "text-green-600" }
    if (percentage >= 80) return { grade: "A", color: "text-green-600" }
    if (percentage >= 70) return { grade: "B+", color: "text-blue-600" }
    if (percentage >= 60) return { grade: "B", color: "text-blue-600" }
    if (percentage >= 50) return { grade: "C", color: "text-yellow-600" }
    return { grade: "F", color: "text-red-600" }
  }

  const grade = getGrade(submission.percentage)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Exam Results</h1>
            <p className="text-muted-foreground mt-1">{exam.name}</p>
          </div>
          <Link href="/dashboard/student/exams">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Exams
            </Button>
          </Link>
        </div>

        {/* Score Summary */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {submission.totalScore.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Out of {exam.totalMarks}</div>
                <div className="text-xs text-muted-foreground mt-1">Total Score</div>
              </div>
              <div className="text-center">
                <div className={cn("text-4xl font-bold", grade.color)}>
                  {submission.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Percentage</div>
                <div className="text-xs text-muted-foreground mt-1">Performance</div>
              </div>
              <div className="text-center">
                <div className={cn("text-4xl font-bold", grade.color)}>
                  {grade.grade}
                </div>
                <div className="text-sm text-muted-foreground">Grade</div>
                <div className="text-xs text-muted-foreground mt-1">Result</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">
                  {Math.floor(submission.timeTakenMinutes / 60)}h {submission.timeTakenMinutes % 60}m
                </div>
                <div className="text-sm text-muted-foreground">Time Taken</div>
                <div className="text-xs text-muted-foreground mt-1">Duration</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {exam.questions.map((question, index) => {
                const answer = answers[question.id]
                const isCorrect = answer?.isCorrect || false
                const studentAnswer = answer?.studentAnswer

                return (
                  <Card
                    key={question.id}
                    className={cn(
                      "border-2",
                      isCorrect
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-lg">
                                Q{index + 1}:
                              </span>
                              {isCorrect ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-600" />
                              )}
                              <Badge
                                variant={isCorrect ? "default" : "destructive"}
                              >
                                {isCorrect
                                  ? `+${answer.marksObtained} marks`
                                  : "0 marks"}
                              </Badge>
                            </div>
                            <p className="font-medium">{question.question}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {["A", "B", "C", "D"].map((option) => {
                            const optionKey = `option${option}` as keyof Question
                            const isCorrectAnswer = question.correctAnswer === option
                            const isStudentAnswer = studentAnswer === option

                            return (
                              <div
                                key={option}
                                className={cn(
                                  "p-3 border-2 rounded-lg",
                                  isCorrectAnswer
                                    ? "border-green-500 bg-green-100"
                                    : isStudentAnswer && !isCorrectAnswer
                                    ? "border-red-500 bg-red-100"
                                    : "border-gray-200"
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{option}.</span>
                                  <span>{question[optionKey]}</span>
                                  {isCorrectAnswer && (
                                    <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <XCircle className="h-4 w-4 text-red-600 ml-auto" />
                                  )}
                                </div>
                                {isCorrectAnswer && (
                                  <div className="text-xs text-green-700 mt-1">
                                    ✓ Correct Answer
                                  </div>
                                )}
                                {isStudentAnswer && !isCorrectAnswer && (
                                  <div className="text-xs text-red-700 mt-1">
                                    ✗ Your Answer
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}













