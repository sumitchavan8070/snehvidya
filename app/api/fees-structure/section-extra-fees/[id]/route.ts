import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// Helper to get user from session
async function getCurrentUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  if (!authHeader) {
    return null
  }
  return { id: 1, role: "Principal" } // TODO: Implement actual auth
}

// PUT - Update section-level extra fee (Principal only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user || user.role !== "Principal") {
      return NextResponse.json(
        { status: 0, error: "Unauthorized. Only Principal can update extra fees." },
        { status: 403 }
      )
    }

    const id = params.id
    const body = await req.json()
    const {
      service_name,
      amount,
      q1,
      q2,
      q3,
      q4,
      is_active,
    } = body

    const updateQuery = `
      UPDATE section_extra_fees 
      SET 
        service_name = ?,
        amount = ?,
        q1 = ?,
        q2 = ?,
        q3 = ?,
        q4 = ?,
        is_active = ?,
        updated_at = NOW()
      WHERE id = ?
    `

    const result = await query<any>(updateQuery, [
      service_name,
      Number(amount) || 0,
      q1 || null,
      q2 || null,
      q3 || null,
      q4 || null,
      is_active !== undefined ? is_active : true,
      id,
    ])

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Section extra fee not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Section extra fee updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating section extra fee:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to update section extra fee", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete section-level extra fee (Principal only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(req)
    if (!user || user.role !== "Principal") {
      return NextResponse.json(
        { status: 0, error: "Unauthorized. Only Principal can delete extra fees." },
        { status: 403 }
      )
    }

    const id = params.id

    const deleteQuery = `DELETE FROM section_extra_fees WHERE id = ?`

    const result = await query<any>(deleteQuery, [id])

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Section extra fee not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Section extra fee deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting section extra fee:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to delete section extra fee", details: error.message },
      { status: 500 }
    )
  }
}










