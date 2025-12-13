import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get all student services (with optional filters)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get("studentId")
    const classId = searchParams.get("classId")
    const serviceName = searchParams.get("serviceName")

    let feesQuery = `
      SELECT 
        ss.id,
        ss.student_id,
        ss.service_name,
        ss.amount,
        ss.is_active,
        ss.start_date,
        ss.end_date,
        ss.notes,
        ss.created_at,
        ss.updated_at,
        s.name as student_name,
        s.roll_number,
        c.name as class_name
      FROM student_services ss
      INNER JOIN students s ON ss.student_id = s.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE 1=1
    `

    const params: any[] = []

    if (studentId) {
      feesQuery += " AND ss.student_id = ?"
      params.push(studentId)
    }

    if (classId) {
      feesQuery += " AND s.class_id = ?"
      params.push(classId)
    }

    if (serviceName) {
      feesQuery += " AND ss.service_name LIKE ?"
      params.push(`%${serviceName}%`)
    }

    feesQuery += " ORDER BY s.name ASC, ss.service_name ASC"

    const services = await query<any[]>(feesQuery, params)

    return NextResponse.json({
      status: 1,
      result: services,
    })
  } catch (error: any) {
    console.error("Error fetching student services:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to fetch student services", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new student service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { student_id, service_name, amount, is_active = true, start_date, end_date, notes } = body

    if (!student_id || !service_name || amount === undefined) {
      return NextResponse.json(
        { status: 0, error: "Student ID, service name, and amount are required" },
        { status: 400 }
      )
    }

    const insertQuery = `
      INSERT INTO student_services 
      (student_id, service_name, amount, is_active, start_date, end_date, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const result = await query<any>(
      insertQuery,
      [
        student_id,
        service_name,
        amount,
        is_active ? 1 : 0,
        start_date || null,
        end_date || null,
        notes || null,
      ]
    )

    const insertId = (result as any).insertId

    return NextResponse.json({
      status: 1,
      message: "Student service created successfully",
      result: { id: insertId },
    })
  } catch (error: any) {
    console.error("Error creating student service:", error)
    
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
      return NextResponse.json(
        { status: 0, error: "This service already exists for this student" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { status: 0, error: "Failed to create student service", details: error.message },
      { status: 500 }
    )
  }
}

