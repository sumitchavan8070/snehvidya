import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// POST - Create a new MCQ exam
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, classId, date, totalQuestions, totalMarks, questions } = body

    // Validate required fields
    if (!name || !classId || !date || !totalQuestions || !totalMarks || !questions) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Validate questions array
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(
        { error: "Questions array is required and must not be empty" },
        { status: 400 }
      )
    }

    // Start transaction by creating exam first
    const examInsertQuery = `
      INSERT INTO mcq_exams (name, class_id, exam_date, total_questions, total_marks, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `
    
    const examResult = await query<any>(
      examInsertQuery,
      [name, classId, date, totalQuestions, totalMarks]
    )

    const examId = (examResult as any).insertId

    if (!examId) {
      return NextResponse.json(
        { error: "Failed to create exam" },
        { status: 500 }
      )
    }

    // Insert questions
    const questionInsertQuery = `
      INSERT INTO mcq_questions 
      (exam_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_answer, marks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    for (const question of questions) {
      await query(
        questionInsertQuery,
        [
          examId,
          question.id,
          question.question,
          question.optionA,
          question.optionB,
          question.optionC,
          question.optionD,
          question.correctAnswer,
          question.marks || Math.floor(totalMarks / totalQuestions),
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: "MCQ exam created successfully",
      examId: examId,
    })
  } catch (error: any) {
    console.error("Error creating MCQ exam:", error)
    return NextResponse.json(
      { error: "Failed to create exam", details: error.message },
      { status: 500 }
    )
  }
}

// GET - Get all MCQ exams
export async function GET(req: NextRequest) {
  try {
    const examsQuery = `
      SELECT 
        e.id,
        e.name,
        e.class_id as classId,
        e.exam_date as date,
        e.total_questions as totalQuestions,
        e.total_marks as totalMarks,
        e.created_at as createdAt
      FROM mcq_exams e
      ORDER BY e.created_at DESC
    `

    const exams = await query<any[]>(examsQuery)

    // For each exam, fetch its questions
    const examsWithQuestions = await Promise.all(
      exams.map(async (exam) => {
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

        const questions = await query<any[]>(questionsQuery, [exam.id])

        return {
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
        }
      })
    )

    return NextResponse.json(examsWithQuestions)
  } catch (error: any) {
    console.error("Error fetching MCQ exams:", error)
    return NextResponse.json(
      { error: "Failed to fetch exams", details: error.message },
      { status: 500 }
    )
  }
}




