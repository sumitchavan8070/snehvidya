"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Clock, CheckCircle2, AlertCircle } from "lucide-react"
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

interface Exam {
  id: number
  name: string
  classId: number
  date: string
  totalQuestions: number
  totalMarks: number
  questions: Question[]
}

export default function TakeExamPage() {
  const router = useRouter()
  const params = useParams()
  const examId = parseInt(params.id as string)

  const [exam, setExam] = useState<Exam | null>(null)
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | "">>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [studentId, setStudentId] = useState<number | null>(null)
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasLoadedRef.current) {
      return
    }

    const loadExam = async () => {
      try {
        hasLoadedRef.current = true
        setLoading(true)
        
        // Get student ID
        const userStr = localStorage.getItem("user")
        const user = userStr ? JSON.parse(userStr) : null
        const studentIdValue = user?.id || user?.studentId || 1
        setStudentId(studentIdValue)

        // Check if submission exists
        let existingSubmission = null
        try {
          existingSubmission = await api.getStudentExamSubmission(studentIdValue, examId)
        } catch (error) {
          // Submission doesn't exist yet, that's fine
        }
        
        if (existingSubmission && existingSubmission.status === "submitted") {
          toast.error("You have already submitted this exam")
          router.push("/dashboard/student/exams")
          return
        }

        // Load exam
        const examData = await api.getMCQExamById(examId)
        setExam(examData)

        // Load existing answers if in progress
        if (existingSubmission && existingSubmission.id && existingSubmission.status === "in_progress") {
          try {
            const savedAnswers = await api.getStudentExamAnswers(existingSubmission.id)
            const answersMap: Record<number, "A" | "B" | "C" | "D"> = {}
            savedAnswers.forEach((answer: any) => {
              if (answer.studentAnswer) {
                answersMap[answer.questionId] = answer.studentAnswer
              }
            })
            setAnswers(answersMap)
          } catch (error) {
            console.error("Failed to load saved answers:", error)
          }
        }

        setStartTime(new Date())
      } catch (error) {
        console.error("Failed to load exam:", error)
        toast.error("Failed to load exam")
        router.push("/dashboard/student/exams")
      } finally {
        setLoading(false)
      }
    }

    if (examId) {
      loadExam()
    }
  }, [examId, router])

  // Timer
  useEffect(() => {
    if (!startTime) return

    const interval = setInterval(() => {
      const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      setTimeElapsed(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const handleAnswerChange = (questionId: number, answer: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
    
    // Auto-save answer
    if (studentId) {
      api.saveStudentExamAnswer(studentId, examId, questionId, answer).catch(console.error)
    }
  }

  const handleNext = () => {
    if (currentQuestionIndex < (exam?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index)
  }

  const handleSubmitExam = async () => {
    if (!exam || !studentId) return

    // Check if all questions are answered
    const unanswered = exam.questions.filter((q) => !answers[q.id])
    if (unanswered.length > 0) {
      const confirmSubmit = confirm(
        `You have ${unanswered.length} unanswered question(s). Are you sure you want to submit?`
      )
      if (!confirmSubmit) {
        setSubmitDialogOpen(false)
        return
      }
    }

    setSubmitting(true)
    try {
      const timeTakenMinutes = Math.floor(timeElapsed / 60)
      await api.submitStudentExam(studentId, examId, answers, timeTakenMinutes)
      toast.success("Exam submitted successfully!")
      router.push(`/dashboard/student/exams/result/${examId}`)
    } catch (error) {
      console.error("Failed to submit exam:", error)
      toast.error("Failed to submit exam")
    } finally {
      setSubmitting(false)
      setSubmitDialogOpen(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (loading || !exam) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const answeredCount = Object.keys(answers).filter((id) => answers[parseInt(id)]).length
  const unansweredCount = exam.questions.length - answeredCount

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{exam.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Class {exam.classId} • {exam.totalQuestions} Questions • {exam.totalMarks} Marks
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Clock className="h-5 w-5" />
                  {formatTime(timeElapsed)}
                </div>
                <div className="text-sm">
                  <div className="text-green-600">Answered: {answeredCount}</div>
                  <div className="text-red-600">Unanswered: {unansweredCount}</div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto">
                {exam.questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={
                      index === currentQuestionIndex
                        ? "default"
                        : answers[q.id]
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
            </CardContent>
          </Card>

          {/* Question Content */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>
                Question {currentQuestionIndex + 1} of {exam.questions.length}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <p className="text-lg font-medium">{currentQuestion.question}</p>
                <p className="text-sm text-muted-foreground">
                  Marks: {currentQuestion.marks}
                </p>
              </div>

              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) =>
                  handleAnswerChange(currentQuestion.id, value as "A" | "B" | "C" | "D")
                }
                className="space-y-4"
              >
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="A" id="optionA" className="mt-1" />
                  <Label htmlFor="optionA" className="flex-1 cursor-pointer">
                    <span className="font-medium">A.</span> {currentQuestion.optionA}
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="B" id="optionB" className="mt-1" />
                  <Label htmlFor="optionB" className="flex-1 cursor-pointer">
                    <span className="font-medium">B.</span> {currentQuestion.optionB}
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="C" id="optionC" className="mt-1" />
                  <Label htmlFor="optionC" className="flex-1 cursor-pointer">
                    <span className="font-medium">C.</span> {currentQuestion.optionC}
                  </Label>
                </div>
                <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value="D" id="optionD" className="mt-1" />
                  <Label htmlFor="optionD" className="flex-1 cursor-pointer">
                    <span className="font-medium">D.</span> {currentQuestion.optionD}
                  </Label>
                </div>
              </RadioGroup>

              <div className="flex justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrev}
                  disabled={currentQuestionIndex === 0}
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  {currentQuestionIndex < exam.questions.length - 1 ? (
                    <Button onClick={handleNext}>Next</Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={() => setSubmitDialogOpen(true)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Submit Exam
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button (Fixed at bottom) */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Make sure to review all questions before submitting
              </div>
              <Button
                size="lg"
                onClick={() => setSubmitDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Submit Exam
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Submit Confirmation Dialog */}
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Exam</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this exam? You won't be able to change your answers after submission.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Answered:</span> {answeredCount} / {exam.questions.length}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Unanswered:</span> {unansweredCount}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Time Taken:</span> {formatTime(timeElapsed)}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSubmitDialogOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmitExam}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? "Submitting..." : "Confirm Submit"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

