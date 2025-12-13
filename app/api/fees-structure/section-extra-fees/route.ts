import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"
import { getServerSession } from "next-auth"

// Helper to get user from session (you'll need to implement this based on your auth setup)
async function getCurrentUser(req: NextRequest) {
  // This is a placeholder - implement based on your authentication system
  // For now, we'll check the Authorization header
  const authHeader = req.headers.get("authorization")
  if (!authHeader) {
    return null
  }
  // You should verify the JWT token and extract user info
  // For now, returning a mock user - replace with actual auth check
  return { id: 1, role: "Principal" } // TODO: Implement actual auth
}

// GET - Get section extra fees for a class
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const className = searchParams.get("class_name")
    const section = searchParams.get("section")

    let queryStr = `
      SELECT 
        sef.id,
        sef.fees_structure_id,
        sef.class_name,
        sef.section,
        sef.service_name,
        sef.amount,
        sef.q1,
        sef.q2,
        sef.q3,
        sef.q4,
        sef.is_active,
        sef.created_at,
        sef.updated_at
      FROM section_extra_fees sef
      WHERE 1=1
    `
    const params: any[] = []

    if (className) {
      queryStr += ` AND sef.class_name = ?`
      params.push(className)
    }

    if (section) {
      queryStr += ` AND sef.section = ?`
      params.push(section)
    }

    queryStr += ` ORDER BY sef.class_name, sef.section, sef.service_name`

    const results = await query<any[]>(queryStr, params)

    return NextResponse.json({
      status: 1,
      result: results,
    })
  } catch (error: any) {
    console.error("Error fetching section extra fees:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to fetch section extra fees", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create section-level extra fee (Principal only)
export async function POST(req: NextRequest) {
  try {
    // Check authorization - Principal only
    const user = await getCurrentUser(req)
    if (!user || user.role !== "Principal") {
      return NextResponse.json(
        { status: 0, error: "Unauthorized. Only Principal can create extra fees." },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      fees_structure_id,
      class_name,
      section,
      service_name,
      amount,
      q1,
      q2,
      q3,
      q4,
      is_active = true,
    } = body

    // Validation
    if (!class_name || !section || !service_name || amount === undefined) {
      return NextResponse.json(
        { status: 0, error: "class_name, section, service_name, and amount are required" },
        { status: 400 }
      )
    }

    const insertQuery = `
      INSERT INTO section_extra_fees 
      (fees_structure_id, class_name, section, service_name, amount, q1, q2, q3, q4, is_active, created_by, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const result = await query<any>(insertQuery, [
      fees_structure_id || null,
      class_name,
      section,
      service_name,
      Number(amount) || 0,
      q1 || null,
      q2 || null,
      q3 || null,
      q4 || null,
      is_active,
      user.id,
    ])

    const insertId = (result as any).insertId

    return NextResponse.json({
      status: 1,
      message: "Section extra fee created successfully",
      result: { id: insertId },
    })
  } catch (error: any) {
    console.error("Error creating section extra fee:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to create section extra fee", details: error.message },
      { status: 500 }
    )
  }
}

