import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get all submissions for a student
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const submissionsQuery = `
      SELECT 
        s.id,
        s.exam_id as examId,
        s.status,
        s.total_score as totalScore,
        s.percentage,
        s.submitted_at as submittedAt,
        s.started_at as startedAt,
        s.time_taken_minutes as timeTakenMinutes
      FROM student_exam_submissions s
      WHERE s.student_id = ?
      ORDER BY s.submitted_at DESC
    `

    const submissions = await query<any[]>(submissionsQuery, [studentId])

    return NextResponse.json(submissions)
  } catch (error: any) {
    console.error("Error fetching student submissions:", error)
    return NextResponse.json(
      { error: "Failed to fetch submissions", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Start or get existing submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, examId } = body

    if (!studentId || !examId) {
      return NextResponse.json(
        { error: "Student ID and Exam ID are required" },
        { status: 400 }
      )
    }

    // Check if submission exists
    const existingQuery = `
      SELECT id, status FROM student_exam_submissions 
      WHERE student_id = ? AND exam_id = ?
    `
    const existing = await query<any[]>(existingQuery, [studentId, examId])

    if (existing.length > 0) {
      return NextResponse.json({
        id: existing[0].id,
        status: existing[0].status,
      })
    }

    // Create new submission
    const insertQuery = `
      INSERT INTO student_exam_submissions (student_id, exam_id, status, started_at)
      VALUES (?, ?, 'in_progress', NOW())
    `
    const result = await query<any>(insertQuery, [studentId, examId])

    return NextResponse.json({
      id: (result as any).insertId,
      status: "in_progress",
    })
  } catch (error: any) {
    console.error("Error creating submission:", error)
    return NextResponse.json(
      { error: "Failed to create submission", details: error.message },
      { status: 500 }
    )
  }
}




