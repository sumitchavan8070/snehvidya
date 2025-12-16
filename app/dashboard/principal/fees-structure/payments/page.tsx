"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface ClassPaymentData {
  [className: string]: {
    [section: string]: {
      total_students: number
      paid_students: number
      pending_students: number
      overdue_students: number
      total_amount: number
      paid_amount: number
      pending_amount: number
      overdue_amount: number
      quarterly_breakdown: {
        Q1: { paid: number; pending: number; overdue: number }
        Q2: { paid: number; pending: number; overdue: number }
        Q3: { paid: number; pending: number; overdue: number }
        Q4: { paid: number; pending: number; overdue: number }
      }
    }
  }
}

export default function ClassWisePaymentsPage() {
  const [payments, setPayments] = useState<ClassPaymentData>({})
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    class_name: "all",
    section: "all",
    quarter: "all",
    status: "all",
  })

  useEffect(() => {
    fetchPayments()
  }, [filters])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filters.class_name !== "all") params.class_name = filters.class_name
      if (filters.section !== "all") params.section = filters.section
      if (filters.quarter !== "all") params.quarter = filters.quarter
      if (filters.status !== "all") params.status = filters.status

      const res = await api.getClassWisePayments(params)
      if (res.status === 1) {
        setPayments(res.result || {})
      } else {
        toast.error(res.error || "Failed to load payments")
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const getPaymentPercentage = (paid: number, total: number) => {
    if (total === 0) return 0
    return Math.round((paid / total) * 100)
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Class-Wise Payments</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            View and manage payments organized by class and section
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select
                value={filters.class_name}
                onValueChange={(value) => setFilters({ ...filters, class_name: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {Object.keys(payments).map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Section</label>
              <Select
                value={filters.section}
                onValueChange={(value) => setFilters({ ...filters, section: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  <SelectItem value="A">Section A</SelectItem>
                  <SelectItem value="B">Section B</SelectItem>
                  <SelectItem value="C">Section C</SelectItem>
                  <SelectItem value="D">Section D</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Quarter</label>
              <Select
                value={filters.quarter}
                onValueChange={(value) => setFilters({ ...filters, quarter: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Quarters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Quarters</SelectItem>
                  <SelectItem value="Q1">Q1 (Apr-Jun)</SelectItem>
                  <SelectItem value="Q2">Q2 (Jul-Sep)</SelectItem>
                  <SelectItem value="Q3">Q3 (Oct-Dec)</SelectItem>
                  <SelectItem value="Q4">Q4 (Jan-Mar)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Summary */}
      {loading ? (
        <Card>
          <CardContent className="py-10">
            <div className="flex items-center justify-center space-x-2 text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading payments...</span>
            </div>
          </CardContent>
        </Card>
      ) : Object.keys(payments).length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            No payment data available
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(payments).map(([className, sections]) => (
            <Card key={className}>
              <CardHeader>
                <CardTitle className="text-xl">{className}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(sections).map(([section, data]) => (
                    <div key={section} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Section {section}</h3>
                        <Badge variant="outline">
                          {getPaymentPercentage(data.paid_amount, data.total_amount)}% Paid
                        </Badge>
                      </div>

                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Students</p>
                          <p className="text-lg font-semibold">{data.total_students}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Paid</p>
                          <p className="text-lg font-semibold text-green-600">
                            {data.paid_students} / {formatCurrency(data.paid_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Pending</p>
                          <p className="text-lg font-semibold text-yellow-600">
                            {data.pending_students} / {formatCurrency(data.pending_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Overdue</p>
                          <p className="text-lg font-semibold text-red-600">
                            {data.overdue_students} / {formatCurrency(data.overdue_amount)}
                          </p>
                        </div>
                      </div>

                      {/* Quarterly Breakdown */}
                      <div>
                        <h4 className="font-medium mb-2">Quarterly Breakdown</h4>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Quarter</TableHead>
                              <TableHead className="text-right">Paid</TableHead>
                              <TableHead className="text-right">Pending</TableHead>
                              <TableHead className="text-right">Overdue</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(["Q1", "Q2", "Q3", "Q4"] as const).map((quarter) => {
                              const qData = data.quarterly_breakdown[quarter]
                              const qTotal = qData.paid + qData.pending + qData.overdue
                              return (
                                <TableRow key={quarter}>
                                  <TableCell className="font-medium">{quarter}</TableCell>
                                  <TableCell className="text-right text-green-600">
                                    {formatCurrency(qData.paid)}
                                  </TableCell>
                                  <TableCell className="text-right text-yellow-600">
                                    {formatCurrency(qData.pending)}
                                  </TableCell>
                                  <TableCell className="text-right text-red-600">
                                    {formatCurrency(qData.overdue)}
                                  </TableCell>
                                  <TableCell className="text-right font-semibold">
                                    {formatCurrency(qTotal)}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}





