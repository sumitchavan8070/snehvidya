import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// PUT - Update a student service
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await req.json()
    const { service_name, amount, is_active, start_date, end_date, notes } = body

    if (!service_name || amount === undefined) {
      return NextResponse.json(
        { status: 0, error: "Service name and amount are required" },
        { status: 400 }
      )
    }

    const updateQuery = `
      UPDATE student_services 
      SET 
        service_name = ?,
        amount = ?,
        is_active = ?,
        start_date = ?,
        end_date = ?,
        notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `

    const result = await query<any>(
      updateQuery,
      [
        service_name,
        amount,
        is_active ? 1 : 0,
        start_date || null,
        end_date || null,
        notes || null,
        id,
      ]
    )

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Student service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Student service updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating student service:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to update student service", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a student service
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const deleteQuery = `DELETE FROM student_services WHERE id = ?`

    const result = await query<any>(deleteQuery, [id])

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Student service not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Student service deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting student service:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to delete student service", details: error.message },
      { status: 500 }
    )
  }
}





