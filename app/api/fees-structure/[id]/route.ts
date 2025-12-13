import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// PUT - Update a fees structure
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
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
      notes 
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

    const updateQuery = `
      UPDATE fees_structure 
      SET 
        class_name = ?,
        tuition_fee = ?,
        annual_fee = ?,
        total_fee = ?,
        q1 = ?,
        q2 = ?,
        q3 = ?,
        q4 = ?,
        additional_services = ?,
        notes = ?,
        updated_at = NOW()
      WHERE id = ?
    `

    const result = await query<any>(
      updateQuery,
      [
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
        id,
      ]
    )

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Fees structure not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Fees structure updated successfully",
    })
  } catch (error: any) {
    console.error("Error updating fees structure:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to update fees structure", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete a fees structure
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id

    const deleteQuery = `DELETE FROM fees_structure WHERE id = ?`

    const result = await query<any>(deleteQuery, [id])

    const affectedRows = (result as any).affectedRows

    if (affectedRows === 0) {
      return NextResponse.json(
        { status: 0, error: "Fees structure not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: 1,
      message: "Fees structure deleted successfully",
    })
  } catch (error: any) {
    console.error("Error deleting fees structure:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to delete fees structure", details: error.message },
      { status: 500 }
    )
  }
}

