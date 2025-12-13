import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get submission for a specific exam
export async function GET(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const examId = parseInt(params.examId)

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    if (isNaN(examId)) {
      return NextResponse.json({ error: "Invalid exam ID" }, { status: 400 })
    }

    const submissionQuery = `
      SELECT 
        id,
        exam_id as examId,
        status,
        total_score as totalScore,
        percentage,
        submitted_at as submittedAt,
        started_at as startedAt,
        time_taken_minutes as timeTakenMinutes
      FROM student_exam_submissions
      WHERE student_id = ? AND exam_id = ?
    `

    const submissions = await query<any[]>(submissionQuery, [studentId, examId])

    if (submissions.length === 0) {
      return NextResponse.json(null)
    }

    return NextResponse.json(submissions[0])
  } catch (error: any) {
    console.error("Error fetching submission:", error)
    return NextResponse.json(
      { error: "Failed to fetch submission", details: error.message },
      { status: 500 }
    )
  }
}




