import { NextRequest, NextResponse } from "next/server"
import { query } from "@/db"

// GET - Get payments organized by class
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const className = searchParams.get("class_name")
    const section = searchParams.get("section")
    const quarter = searchParams.get("quarter")
    const status = searchParams.get("status")

    // Build query to get payment summary by class and section
    let queryStr = `
      SELECT 
        cp.class_name,
        cp.section,
        cp.quarter,
        cp.status,
        COUNT(DISTINCT cp.student_id) as student_count,
        SUM(cp.amount) as total_amount,
        COUNT(CASE WHEN cp.status = 'paid' THEN 1 END) as paid_count,
        SUM(CASE WHEN cp.status = 'paid' THEN cp.amount ELSE 0 END) as paid_amount,
        COUNT(CASE WHEN cp.status = 'pending' THEN 1 END) as pending_count,
        SUM(CASE WHEN cp.status = 'pending' THEN cp.amount ELSE 0 END) as pending_amount,
        COUNT(CASE WHEN cp.status = 'overdue' THEN 1 END) as overdue_count,
        SUM(CASE WHEN cp.status = 'overdue' THEN cp.amount ELSE 0 END) as overdue_amount
      FROM class_payments cp
      WHERE 1=1
    `
    const params: any[] = []

    if (className) {
      queryStr += ` AND cp.class_name = ?`
      params.push(className)
    }

    if (section) {
      queryStr += ` AND cp.section = ?`
      params.push(section)
    }

    if (quarter) {
      queryStr += ` AND cp.quarter = ?`
      params.push(quarter)
    }

    if (status) {
      queryStr += ` AND cp.status = ?`
      params.push(status)
    }

    queryStr += ` GROUP BY cp.class_name, cp.section, cp.quarter, cp.status`

    const results = await query<any[]>(queryStr, params)

    // Organize results by class and section
    const organized: Record<string, Record<string, any>> = {}

    results.forEach((row: any) => {
      const className = row.class_name || "Unknown"
      const section = row.section || "All"
      
      if (!organized[className]) {
        organized[className] = {}
      }
      
      if (!organized[className][section]) {
        organized[className][section] = {
          total_students: 0,
          paid_students: 0,
          pending_students: 0,
          overdue_students: 0,
          total_amount: 0,
          paid_amount: 0,
          pending_amount: 0,
          overdue_amount: 0,
          quarterly_breakdown: {
            Q1: { paid: 0, pending: 0, overdue: 0 },
            Q2: { paid: 0, pending: 0, overdue: 0 },
            Q3: { paid: 0, pending: 0, overdue: 0 },
            Q4: { paid: 0, pending: 0, overdue: 0 },
          },
        }
      }

      const sectionData = organized[className][section]
      const quarter = row.quarter || "All"

      // Update totals
      sectionData.total_students = Math.max(sectionData.total_students, row.student_count || 0)
      sectionData.total_amount += Number(row.total_amount) || 0

      if (row.status === "paid") {
        sectionData.paid_students = row.paid_count || 0
        sectionData.paid_amount += Number(row.paid_amount) || 0
        if (quarter !== "All" && sectionData.quarterly_breakdown[quarter]) {
          sectionData.quarterly_breakdown[quarter].paid += Number(row.paid_amount) || 0
        }
      } else if (row.status === "pending") {
        sectionData.pending_students = row.pending_count || 0
        sectionData.pending_amount += Number(row.pending_amount) || 0
        if (quarter !== "All" && sectionData.quarterly_breakdown[quarter]) {
          sectionData.quarterly_breakdown[quarter].pending += Number(row.pending_amount) || 0
        }
      } else if (row.status === "overdue") {
        sectionData.overdue_students = row.overdue_count || 0
        sectionData.overdue_amount += Number(row.overdue_amount) || 0
        if (quarter !== "All" && sectionData.quarterly_breakdown[quarter]) {
          sectionData.quarterly_breakdown[quarter].overdue += Number(row.overdue_amount) || 0
        }
      }
    })

    return NextResponse.json({
      status: 1,
      result: organized,
    })
  } catch (error: any) {
    console.error("Error fetching class-wise payments:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to fetch class-wise payments", details: error.message },
      { status: 500 }
    )
  }
}





