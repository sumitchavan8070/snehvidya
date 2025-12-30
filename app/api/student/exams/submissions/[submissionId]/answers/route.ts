import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get answers for a submission
export async function GET(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = parseInt(params.submissionId)

    if (isNaN(submissionId)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 })
    }

    const answersQuery = `
      SELECT 
        question_id as questionId,
        student_answer as studentAnswer,
        is_correct as isCorrect,
        marks_obtained as marksObtained
      FROM student_exam_answers
      WHERE submission_id = ?
    `

    const answers = await query<any[]>(answersQuery, [submissionId])

    return NextResponse.json(answers)
  } catch (error: any) {
    console.error("Error fetching answers:", error)
    return NextResponse.json(
      { error: "Failed to fetch answers", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Save a single answer
export async function POST(
  req: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const submissionId = parseInt(params.submissionId)
    const body = await req.json()
    const { questionId, studentAnswer } = body

    if (isNaN(submissionId) || !questionId || !studentAnswer) {
      return NextResponse.json(
        { error: "Submission ID, Question ID, and Answer are required" },
        { status: 400 }
      )
    }

    // Get question details to check if answer is correct
    const questionQuery = `
      SELECT correct_answer, marks 
      FROM mcq_questions 
      WHERE id = ?
    `
    const questions = await query<any[]>(questionQuery, [questionId])
    
    if (questions.length === 0) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    const question = questions[0]
    const isCorrect = studentAnswer === question.correct_answer
    const marksObtained = isCorrect ? question.marks : 0

    // Insert or update answer
    const answerQuery = `
      INSERT INTO student_exam_answers 
      (submission_id, question_id, student_answer, is_correct, marks_obtained)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        student_answer = VALUES(student_answer),
        is_correct = VALUES(is_correct),
        marks_obtained = VALUES(marks_obtained)
    `
    await query(answerQuery, [
      submissionId,
      questionId,
      studentAnswer,
      isCorrect,
      marksObtained,
    ])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving answer:", error)
    return NextResponse.json(
      { error: "Failed to save answer", details: error.message },
      { status: 500 }
    )
  }
}













