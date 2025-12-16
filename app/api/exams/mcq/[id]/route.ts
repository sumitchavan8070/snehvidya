import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get a specific MCQ exam by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = parseInt(params.id)

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    // Get exam details
    const examQuery = `
      SELECT 
        id,
        name,
        class_id as classId,
        exam_date as date,
        total_questions as totalQuestions,
        total_marks as totalMarks,
        created_at as createdAt
      FROM mcq_exams
      WHERE id = ?
    `

    const exams = await query<any[]>(examQuery, [examId])

    if (exams.length === 0) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    const exam = exams[0]

    // Get questions
    const questionsQuery = `
      SELECT 
        id,
        question_number as id,
        question_text as question,
        option_a as optionA,
        option_b as optionB,
        option_c as optionC,
        option_d as optionD,
        correct_answer as correctAnswer,
        marks
      FROM mcq_questions
      WHERE exam_id = ?
      ORDER BY question_number ASC
    `

    const questions = await query<any[]>(questionsQuery, [examId])

    return NextResponse.json({
      ...exam,
      questions: questions.map((q) => ({
        id: q.id,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching MCQ exam:", error)
    return NextResponse.json(
      { error: "Failed to fetch exam", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a specific MCQ exam
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const examId = parseInt(params.id)

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    // Delete questions first (due to foreign key constraint)
    await query("DELETE FROM mcq_questions WHERE exam_id = ?", [examId])

    // Delete exam
    await query("DELETE FROM mcq_exams WHERE id = ?", [examId])

    return NextResponse.json({
      success: true,
      message: "Exam deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting MCQ exam:", error)
    return NextResponse.json(
      { error: "Failed to delete exam", details: error.message },
      { status: 500 }
    )
  }
}








