import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get all fees structures
export async function GET(req: NextRequest) {
  try {
    const feesQuery = `
      SELECT 
        id,
        school_id,
        class_name,
        tuition_fee,
        annual_fee,
        total_fee,
        q1,
        q2,
        q3,
        q4,
        additional_services,
        notes,
        created_at,
        updated_at
      FROM fees_structure
      ORDER BY class_name ASC
    `

    const fees = await query<any[]>(feesQuery)

    return NextResponse.json({
      status: 1,
      result: fees.map((fee) => ({
        ...fee,
        additional_services: fee.additional_services 
          ? (typeof fee.additional_services === 'string' 
              ? JSON.parse(fee.additional_services) 
              : fee.additional_services)
          : null,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching fees structure:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to fetch fees structure", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new fees structure
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      class_name, 
      tuition_fee, 
      annual_fee, 
      q1, 
      q2, 
      q3, 
      q4, 
      services, 
      notes,
      school_id = 1 
    } = body

    if (!class_name) {
      return NextResponse.json(
        { status: 0, error: "Class name is required" },
        { status: 400 }
      )
    }

    // Calculate total fee
    const tuition = Number(tuition_fee) || 0
    const annual = Number(annual_fee) || 0
    const servicesTotal = Array.isArray(services)
      ? services.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)
      : 0
    const total_fee = tuition + annual + servicesTotal

    // Prepare additional_services as JSON
    const additional_services = Array.isArray(services) && services.length > 0
      ? JSON.stringify(
          services.reduce((acc, service) => {
            if (service.name && service.amount) {
              acc[service.name] = Number(service.amount) || 0
            }
            return acc
          }, {} as Record<string, number>)
        )
      : null

    const insertQuery = `
      INSERT INTO fees_structure 
      (school_id, class_name, tuition_fee, annual_fee, total_fee, q1, q2, q3, q4, additional_services, notes, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    const result = await query<any>(
      insertQuery,
      [
        school_id,
        class_name,
        tuition_fee || null,
        annual_fee || null,
        total_fee,
        q1 || null,
        q2 || null,
        q3 || null,
        q4 || null,
        additional_services,
        notes || null,
      ]
    )

    const insertId = (result as any).insertId

    return NextResponse.json({
      status: 1,
      message: "Fees structure created successfully",
      result: { id: insertId },
    })
  } catch (error: any) {
    console.error("Error creating fees structure:", error)
    
    // Handle duplicate class_name error
    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate')) {
      return NextResponse.json(
        { status: 0, error: "A fees structure for this class already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { status: 0, error: "Failed to create fees structure", details: error.message },
      { status: 500 }
    )
  }
}





