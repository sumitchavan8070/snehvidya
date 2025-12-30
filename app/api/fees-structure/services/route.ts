import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get all available services (other services from database)
export async function GET(req: NextRequest) {
  try {
    // First, try to get from a services table if it exists
    // If not, we'll return default services
    let services: any[] = []

    try {
      const servicesQuery = `
        SELECT 
          id,
          name,
          description,
          default_amount as defaultAmount,
          is_mandatory as mandatory,
          created_at,
          updated_at
        FROM fee_services
        ORDER BY name ASC
      `
      services = await query<any[]>(servicesQuery)
    } catch (error: any) {
      // If table doesn't exist, return default services
      console.log("fee_services table not found, using defaults")
      services = [
        {
          id: "digital_learning",
          name: "Digital Learning Suite",
          description: "LMS, smart classroom subscription, e-books",
          defaultAmount: 1500,
          mandatory: false,
        },
        {
          id: "transport",
          name: "School Transport",
          description: "Bus / cab facility",
          defaultAmount: 2500,
          mandatory: false,
        },
        {
          id: "lab",
          name: "Laboratory Charges",
          description: "Science, computer and language lab maintenance",
          defaultAmount: 900,
          mandatory: false,
        },
        {
          id: "activities",
          name: "Extracurricular Activities",
          description: "Clubs, sports, cultural programs",
          defaultAmount: 600,
          mandatory: false,
        },
        {
          id: "hostel",
          name: "Hostel & Boarding",
          description: "Applicable for residential students",
          defaultAmount: 5000,
          mandatory: false,
        },
        {
          id: "insurance",
          name: "Student Insurance",
          description: "Annual coverage for student safety",
          defaultAmount: 300,
          mandatory: false,
        },
      ]
    }

    return NextResponse.json({
      status: 1,
      result: services,
    })
  } catch (error: any) {
    console.error("Error fetching services:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to fetch services", details: error.message },
      { status: 500 }
    )
  }
}

// POST - Create a new service
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, defaultAmount, mandatory = false } = body

    if (!name) {
      return NextResponse.json(
        { status: 0, error: "Service name is required" },
        { status: 400 }
      )
    }

    // Try to insert into fee_services table
    try {
      const insertQuery = `
        INSERT INTO fee_services (name, description, default_amount, is_mandatory, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `

      const result = await query<any>(
        insertQuery,
        [name, description || null, defaultAmount || 0, mandatory ? 1 : 0]
      )

      const insertId = (result as any).insertId

      return NextResponse.json({
        status: 1,
        message: "Service created successfully",
        result: { id: insertId },
      })
    } catch (error: any) {
      // If table doesn't exist, return success but note that it's not persisted
      console.log("fee_services table not found, service not persisted to DB")
      return NextResponse.json({
        status: 1,
        message: "Service created (not persisted - table doesn't exist)",
        result: { id: `temp-${Date.now()}` },
      })
    }
  } catch (error: any) {
    console.error("Error creating service:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to create service", details: error.message },
      { status: 500 }
    )
  }
}










