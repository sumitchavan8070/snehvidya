"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { api } from "@/lib/api"
import {
  Calculator,
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { format } from "date-fns"

interface Transaction {
  id: number
  type: string
  studentId?: number
  studentName?: string
  studentCode?: string
  amount: number
  status: "success" | "pending" | "failed"
  paymentMethod?: string
  createdAt: string
  description?: string
  referenceNo?: string
}

export default function AccountantTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [page, setPage] = useState(1)
  const [limit] = useState(50)

  useEffect(() => {
    fetchTransactions()
  }, [page, typeFilter, statusFilter, dateFilter, startDate, endDate])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        limit,
      }

      if (typeFilter !== "all") {
        params.type = typeFilter
      }

      if (statusFilter !== "all") {
        params.status = statusFilter
      }

      if (dateFilter === "custom" && startDate && endDate) {
        params.startDate = startDate
        params.endDate = endDate
      } else if (dateFilter === "today") {
        const today = format(new Date(), "yyyy-MM-dd")
        params.startDate = today
        params.endDate = today
      } else if (dateFilter === "week") {
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        params.startDate = format(weekAgo, "yyyy-MM-dd")
        params.endDate = format(new Date(), "yyyy-MM-dd")
      } else if (dateFilter === "month") {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        params.startDate = format(monthAgo, "yyyy-MM-dd")
        params.endDate = format(new Date(), "yyyy-MM-dd")
      }

      const res = await api.getTransactions(params)

      if (res.status === 1) {
        // Transform the data to match our interface
        const transformedTransactions: Transaction[] = (res.data || []).map((txn: any) => ({
          id: txn.id,
          type: txn.type || "payment",
          studentId: txn.studentId || txn.student_id,
          studentName: txn.studentName || txn.student_name,
          studentCode: txn.studentCode || txn.student_code,
          amount: parseFloat(txn.amount) || 0,
          status: txn.status || "success",
          paymentMethod: txn.paymentMethod || txn.payment_method,
          createdAt: txn.createdAt || txn.created_at || txn.date || "",
          description: txn.description,
          referenceNo: txn.referenceNo || txn.reference_no,
        }))
        setTransactions(transformedTransactions)
      } else {
        toast.error(res.message || "Failed to load transactions")
      }
    } catch (error: any) {
      console.error("Error fetching transactions:", error)
      toast.error("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      payment: "bg-blue-500",
      refund: "bg-orange-500",
      fee: "bg-purple-500",
      deposit: "bg-green-500",
      withdrawal: "bg-red-500",
    }

    return (
      <Badge className={typeColors[type.toLowerCase()] || "bg-gray-500"}>
        {type.toUpperCase()}
      </Badge>
    )
  }

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const totalAmount = filteredTransactions.reduce((sum, txn) => {
    if (txn.type === "refund" || txn.type === "withdrawal") {
      return sum - txn.amount
    }
    return sum + txn.amount
  }, 0)

  const todayTransactions = filteredTransactions.filter(
    (txn) =>
      format(new Date(txn.createdAt), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  )
  const todayTotal = todayTransactions.reduce((sum, txn) => {
    if (txn.type === "refund" || txn.type === "withdrawal") {
      return sum - txn.amount
    }
    return sum + txn.amount
  }, 0)

  const handleExport = () => {
    let csvContent = "Transaction ID,Type,Student Name,Student Code,Amount,Status,Payment Method,Date,Description,Reference\n"

    filteredTransactions.forEach((txn) => {
      csvContent += `${txn.id},${txn.type},${txn.studentName || "N/A"},${txn.studentCode || "N/A"},₹${txn.amount.toLocaleString("en-IN")},${txn.status},${txn.paymentMethod || "N/A"},${format(new Date(txn.createdAt), "yyyy-MM-dd HH:mm")},${txn.description || "N/A"},${txn.referenceNo || "N/A"}\n`
    })

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions-${format(new Date(), "yyyy-MM-dd")}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast.success("Transactions exported successfully")
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Calculator className="h-8 w-8 text-indigo-600" />
            Transactions
          </h2>
          <p className="text-muted-foreground mt-1">View and manage all financial transactions</p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTransactions.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${totalAmount >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ₹{Math.abs(totalAmount).toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalAmount >= 0 ? (
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Net positive
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  Net negative
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Transactions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              ₹{Math.abs(todayTotal).toLocaleString("en-IN")} net
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter((t) => t.status === "success").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="deposit">Deposit</SelectItem>
                  <SelectItem value="withdrawal">Withdrawal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateFilter === "custom" && (
              <div className="space-y-2">
                <Label>Custom Dates</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Start"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="End"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>List of all financial transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeBadge(txn.type)}
                        {getStatusBadge(txn.status)}
                        {txn.studentName && (
                          <span className="font-semibold">{txn.studentName}</span>
                        )}
                        {txn.studentCode && (
                          <span className="text-sm text-muted-foreground">
                            ({txn.studentCode})
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {txn.createdAt
                            ? format(new Date(txn.createdAt), "MMM d, yyyy HH:mm")
                            : "N/A"}
                        </div>
                        {txn.paymentMethod && (
                          <div>
                            <span className="font-medium">Method:</span> {txn.paymentMethod}
                          </div>
                        )}
                        {txn.referenceNo && (
                          <div>
                            <span className="font-medium">Ref:</span> {txn.referenceNo}
                          </div>
                        )}
                        {txn.description && (
                          <div>
                            <span className="font-medium">Description:</span> {txn.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-2xl font-bold ${
                          txn.type === "refund" || txn.type === "withdrawal"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {txn.type === "refund" || txn.type === "withdrawal" ? "-" : "+"}₹
                        {txn.amount.toLocaleString("en-IN")}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Transaction #{txn.id}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredTransactions.length >= limit && (
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={filteredTransactions.length < limit}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}




