import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// POST - Submit exam answers
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, examId, answers, timeTakenMinutes } = body

    if (!studentId || !examId || !answers) {
      return NextResponse.json(
        { error: "Student ID, Exam ID, and answers are required" },
        { status: 400 }
      )
    }

    // Get or create submission
    const submissionQuery = `
      SELECT id FROM student_exam_submissions 
      WHERE student_id = ? AND exam_id = ?
    `
    let submissions = await query<any[]>(submissionQuery, [studentId, examId])
    
    let submissionId: number
    if (submissions.length === 0) {
      // Create new submission
      const insertQuery = `
        INSERT INTO student_exam_submissions (student_id, exam_id, status, started_at)
        VALUES (?, ?, 'in_progress', NOW())
      `
      const result = await query<any>(insertQuery, [studentId, examId])
      submissionId = (result as any).insertId
    } else {
      submissionId = submissions[0].id
    }

    // Get exam questions with correct answers
    const questionsQuery = `
      SELECT id, correct_answer, marks 
      FROM mcq_questions 
      WHERE exam_id = ?
    `
    const questions = await query<any[]>(questionsQuery, [examId])

    let totalScore = 0
    let totalMarks = 0

    // Save answers and calculate score
    for (const question of questions) {
      const studentAnswer = answers[question.id] || null
      const isCorrect = studentAnswer === question.correct_answer
      const marksObtained = isCorrect ? question.marks : 0

      totalScore += marksObtained
      totalMarks += question.marks

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
        question.id,
        studentAnswer,
        isCorrect,
        marksObtained,
      ])
    }

    // Calculate percentage
    const percentage = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0

    // Update submission
    const updateQuery = `
      UPDATE student_exam_submissions
      SET 
        status = 'submitted',
        submitted_at = NOW(),
        total_score = ?,
        percentage = ?,
        time_taken_minutes = ?
      WHERE id = ?
    `
    await query(updateQuery, [
      totalScore,
      percentage,
      timeTakenMinutes || 0,
      submissionId,
    ])

    return NextResponse.json({
      success: true,
      submissionId,
      totalScore,
      totalMarks,
      percentage: percentage.toFixed(2),
    })
  } catch (error: any) {
    console.error("Error submitting exam:", error)
    return NextResponse.json(
      { error: "Failed to submit exam", details: error.message },
      { status: 500 }
    )
  }
}








