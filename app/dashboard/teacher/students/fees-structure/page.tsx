"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

type NullableNumber = number | null

interface RawFeeStructure {
  id?: number
  school_id: number
  class_name: string
  tuition_fee: NullableNumber
  annual_fee: NullableNumber
  total_fee: NullableNumber
  q1: NullableNumber
  q2: NullableNumber
  q3: NullableNumber
  q4: NullableNumber
  additional_services?: Record<string, any> | string | null
}

interface ServiceBreakdown {
  name: string
  amount: number
  category: "core" | "service"
}

interface FeeStructure extends RawFeeStructure {
  services: ServiceBreakdown[]
}

interface FeeOverride {
  class_name: string
  tuition_fee?: NullableNumber
  annual_fee?: NullableNumber
  q1?: NullableNumber
  q2?: NullableNumber
  q3?: NullableNumber
  q4?: NullableNumber
  services?: Array<{ id: string; name: string; amount: number }>
  total_fee?: NullableNumber
}

const FEES_OVERRIDES_KEY = "sv_fee_structure_overrides"

const CORE_LABELS: Record<keyof Pick<RawFeeStructure, "tuition_fee" | "annual_fee">, string> = {
  tuition_fee: "Tuition",
  annual_fee: "Annual"
}

export default function FeesStructureManagement() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesStructure()
      // const data = await res.json()

      if (res.status !== 1) {
        toast.error("Failed to load fees")
        return
      }

      const parsedFees: FeeStructure[] = res.result.map((fee: any) => ({
        ...fee,
        tuition_fee: parseFloat(fee.tuition_fee),
        annual_fee: parseFloat(fee.annual_fee),
        total_fee: parseFloat(fee.total_fee),
        q1: parseFloat(fee.q1),
        q2: parseFloat(fee.q2),
        q3: parseFloat(fee.q3),
        q4:  parseFloat(fee.q4),
      }))

      setFees(parsedFees)
    } catch (err) {
      console.error("Error in fetchFees:", err)
      toast.error("Error fetching fees.")
      setFees([])
    } finally {
      setLoading(false)
    }
  }

  const totalByCategory = useMemo(() => {
    return fees.reduce(
      (acc, fee) => {
        fee.services.forEach((service) => {
          acc[service.category] = (acc[service.category] || 0) + service.amount
        })
        return acc
      },
      {} as Record<ServiceBreakdown["category"], number>
    )
  }, [fees])

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Fees Structure
        </h1>
        <div className="text-sm text-muted-foreground">
          <p>Total Core Fees: <span className="font-semibold">₹{(totalByCategory.core || 0).toLocaleString()}</span></p>
          <p>Additional Services: <span className="font-semibold">₹{(totalByCategory.service || 0).toLocaleString()}</span></p>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Current Fees Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Tuition Fee</TableHead>
                  <TableHead className="text-right">Annual Fee</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead>Services Included</TableHead>
                  <TableHead className="text-right">Q1</TableHead>
                  <TableHead className="text-right">Q2</TableHead>
                  <TableHead className="text-right">Q3</TableHead>
                  <TableHead className="text-right">Q4</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading fees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : fees.length > 0 ? (
                  fees.map(fee => (
                    <TableRow key={fee.id}>
                      <TableCell>{fee.class_name}</TableCell>
                      <TableCell className="text-right">
                        {fee.tuition_fee !== null ? `₹${fee.tuition_fee.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.annual_fee !== null ? `₹${fee.annual_fee.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-blue-600">
                        {fee.total_fee !== null ? `₹${fee.total_fee.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {fee.services.map((service) => (
                            <Badge key={`${fee.id}-${service.name}`} variant={service.category === "service" ? "outline" : "default"}>
                              {service.name}: ₹{service.amount.toLocaleString()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.q1 !== null ? `₹${fee.q1.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.q2 !== null ? `₹${fee.q2.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.q3 !== null ? `₹${fee.q3.toLocaleString()}` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {fee.q4 !== null ? `₹${fee.q4.toLocaleString()}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                      No fees structure found. Click "Add New Fee" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}

function parseOptionalServices(raw: RawFeeStructure["additional_services"]): ServiceBreakdown[] {
  if (!raw) return []
  let data: any = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch (error) {
      console.warn("Failed to parse additional services JSON:", error)
      return []
    }
  }
  if (typeof data !== "object" || Array.isArray(data)) return []

  return Object.entries(data).reduce<ServiceBreakdown[]>((acc, [key, value]) => {
    const amount = typeof value === "number" ? value : parseFloat(value as any)
    if (!isNaN(amount)) {
      acc.push({
        name: formatServiceName(key),
        amount,
        category: "service"
      })
    }
    return acc
  }, [])
}

function formatServiceName(key: string) {
  return key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function loadOverrides(): FeeOverride[] {
  if (typeof window === "undefined") return []
  try {
    const stored = window.localStorage.getItem(FEES_OVERRIDES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn("Unable to parse stored fee overrides:", error)
    return []
  }
}

function applyOverrides(fees: FeeStructure[], overrides: FeeOverride[]) {
  if (!overrides.length) return fees
  return fees.map((fee) => {
    const override = overrides.find((item) => item.class_name === fee.class_name)
    if (!override) return fee

    const tuition = override.tuition_fee ?? fee.tuition_fee
    const annual = override.annual_fee ?? fee.annual_fee
    const overrideServices =
      override.services?.map<ServiceBreakdown>((service) => ({
        name: service.name,
        amount: service.amount,
        category: "service",
      })) ?? fee.services.filter((service) => service.category === "service")

    const total =
      override.total_fee ??
      (tuition ?? 0) +
        (annual ?? 0) +
        overrideServices.reduce((acc, service) => acc + (Number.isFinite(service.amount) ? service.amount : 0), 0)

    return {
      ...fee,
      tuition_fee: tuition,
      annual_fee: annual,
      total_fee: total,
      q1: override.q1 ?? fee.q1,
      q2: override.q2 ?? fee.q2,
      q3: override.q3 ?? fee.q3,
      q4: override.q4 ?? fee.q4,
      services: [
        {
          name: "Tuition",
          amount: tuition ?? 0,
          category: "core",
        },
        {
          name: "Annual",
          amount: annual ?? 0,
          category: "core",
        },
        ...overrideServices,
      ],
    }
  })
}
