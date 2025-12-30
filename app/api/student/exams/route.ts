import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get all exams available for a student (based on their class)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    // Get student's class ID (you may need to adjust this query based on your student table structure)
    const studentQuery = `
      SELECT class_id FROM students WHERE id = ? 
      UNION
      SELECT class_id FROM users WHERE id = ? AND role_id = (SELECT id FROM roles WHERE name = 'student')
    `
    const studentResult = await query<any[]>(studentQuery, [studentId, studentId])
    
    if (studentResult.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const classId = studentResult[0].class_id

    // Get exams for this class
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
      WHERE e.class_id = ?
      ORDER BY e.exam_date DESC
    `

    const exams = await query<any[]>(examsQuery, [classId])

    return NextResponse.json(exams)
  } catch (error: any) {
    console.error("Error fetching student exams:", error)
    return NextResponse.json(
      { error: "Failed to fetch exams", details: error.message },
      { status: 500 }
    )
  }
}













