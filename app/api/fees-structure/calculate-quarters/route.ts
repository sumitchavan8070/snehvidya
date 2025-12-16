import { NextRequest, NextResponse } from "next/server"

// POST - Calculate quarterly distribution from total amount
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { total_amount, distribution_type = "equal", custom_distribution } = body

    if (!total_amount || total_amount <= 0) {
      return NextResponse.json(
        { status: 0, error: "total_amount is required and must be greater than 0" },
        { status: 400 }
      )
    }

    let q1 = 0
    let q2 = 0
    let q3 = 0
    let q4 = 0

    if (distribution_type === "equal") {
      // Equal distribution across 4 quarters
      const quarterAmount = Number(total_amount) / 4
      q1 = Math.round(quarterAmount * 100) / 100
      q2 = Math.round(quarterAmount * 100) / 100
      q3 = Math.round(quarterAmount * 100) / 100
      // Q4 gets any remainder to ensure total matches
      q4 = Number(total_amount) - q1 - q2 - q3
    } else if (distribution_type === "custom" && custom_distribution) {
      // Custom distribution with percentages
      const { q1_percent, q2_percent, q3_percent, q4_percent } = custom_distribution
      const totalPercent = (q1_percent || 0) + (q2_percent || 0) + (q3_percent || 0) + (q4_percent || 0)
      
      if (Math.abs(totalPercent - 100) > 0.01) {
        return NextResponse.json(
          { status: 0, error: "Custom distribution percentages must sum to 100" },
          { status: 400 }
        )
      }

      q1 = Math.round((Number(total_amount) * (q1_percent || 0) / 100) * 100) / 100
      q2 = Math.round((Number(total_amount) * (q2_percent || 0) / 100) * 100) / 100
      q3 = Math.round((Number(total_amount) * (q3_percent || 0) / 100) * 100) / 100
      q4 = Number(total_amount) - q1 - q2 - q3
    } else {
      return NextResponse.json(
        { status: 0, error: "Invalid distribution_type or missing custom_distribution" },
        { status: 400 }
      )
    }

    return NextResponse.json({
      status: 1,
      result: {
        q1: Math.round(q1 * 100) / 100,
        q2: Math.round(q2 * 100) / 100,
        q3: Math.round(q3 * 100) / 100,
        q4: Math.round(q4 * 100) / 100,
        total: Math.round((q1 + q2 + q3 + q4) * 100) / 100,
      },
    })
  } catch (error: any) {
    console.error("Error calculating quarters:", error)
    return NextResponse.json(
      { status: 0, error: "Failed to calculate quarters", details: error.message },
      { status: 500 }
    )
  }
}





