"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { api } from "@/lib/api"
import {
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Loader2,
  BarChart3,
  PieChart,
} from "lucide-react"
import { format } from "date-fns"

interface FinancialReport {
  reportType: string
  totalRevenue: number
  totalExpenses?: number
  netIncome?: number
  period: string
  breakdown?: {
    category: string
    amount: number
    percentage: number
  }[]
  trends?: {
    period: string
    revenue: number
    expenses?: number
  }[]
}

export default function AccountantReportsPage() {
  const [report, setReport] = useState<FinancialReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [reportType, setReportType] = useState("monthly")
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"))
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const generateReport = async () => {
    setLoading(true)
    try {
      const params: any = {
        reportType,
      }

      if (reportType === "monthly") {
        params.month = month
      } else if (reportType === "yearly") {
        params.year = parseInt(year)
      } else if (reportType === "custom") {
        if (!startDate || !endDate) {
          toast.error("Please select both start and end dates")
          setLoading(false)
          return
        }
        params.startDate = startDate
        params.endDate = endDate
      }

      const res = await api.getFinancialReports(params)

      if (res.status === 1) {
        setReport(res.data)
        toast.success("Report generated successfully")
      } else {
        toast.error(res.message || "Failed to generate report")
      }
    } catch (error: any) {
      console.error("Error generating report:", error)
      toast.error("Failed to generate report")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!report) return

    // Create CSV content
    let csvContent = `Financial Report - ${report.reportType}\n`
    csvContent += `Period: ${report.period}\n`
    csvContent += `Total Revenue: ₹${report.totalRevenue.toLocaleString("en-IN")}\n\n`

    if (report.breakdown) {
      csvContent += "Category,Amount,Percentage\n"
      report.breakdown.forEach((item) => {
        csvContent += `${item.category},₹${item.amount.toLocaleString("en-IN")},${item.percentage}%\n`
      })
    }

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `financial-report-${reportType}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success("Report downloaded successfully")
  }

  useEffect(() => {
    // Auto-generate report on mount with default monthly report
    generateReport()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-8 w-8 text-indigo-600" />
            Financial Reports
          </h2>
          <p className="text-muted-foreground mt-1">Generate and analyze financial reports</p>
        </div>
        {report && (
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Report
          </Button>
        )}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>Select report type and period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reportType === "monthly" && (
              <div className="space-y-2">
                <Label>Month</Label>
                <Input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                />
              </div>
            )}

            {reportType === "yearly" && (
              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  min="2020"
                  max="2030"
                />
              </div>
            )}

            {reportType === "custom" && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            {reportType === "quarterly" && (
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Q1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="Q2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="Q3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="Q4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button onClick={generateReport} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {loading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {!loading && report && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{report.totalRevenue.toLocaleString("en-IN")}
                </div>
                <p className="text-xs text-muted-foreground">{report.period}</p>
              </CardContent>
            </Card>

            {report.totalExpenses !== undefined && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ₹{report.totalExpenses.toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </CardContent>
              </Card>
            )}

            {report.netIncome !== undefined && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-2xl font-bold ${
                      report.netIncome >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ₹{report.netIncome.toLocaleString("en-IN")}
                  </div>
                  <p className="text-xs text-muted-foreground">Profit/Loss</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Breakdown */}
          {report.breakdown && report.breakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>Category-wise revenue distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.breakdown.map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {item.percentage}%
                          </span>
                          <span className="font-semibold">
                            ₹{item.amount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trends */}
          {report.trends && report.trends.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Revenue Trends
                </CardTitle>
                <CardDescription>Revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.trends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{trend.period}</p>
                        {trend.expenses !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            Expenses: ₹{trend.expenses.toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ₹{trend.revenue.toLocaleString("en-IN")}
                        </p>
                        {trend.expenses !== undefined && (
                          <p className="text-sm text-muted-foreground">
                            Net: ₹
                            {(trend.revenue - trend.expenses).toLocaleString("en-IN")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {!report.breakdown && !report.trends && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No detailed breakdown available</p>
                <p className="text-sm text-muted-foreground">
                  The report contains summary information only
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!loading && !report && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No report generated</p>
            <p className="text-sm text-muted-foreground">
              Configure and generate a financial report to view data
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




