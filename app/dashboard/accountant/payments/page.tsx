"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  Receipt,
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  Calendar,
  CreditCard,
} from "lucide-react"
import { format } from "date-fns"

interface Payment {
  id: number
  studentId: number
  studentName: string
  studentCode: string
  feeId: number
  feeType: string
  amount: number
  paymentMethod: string
  paymentDate: string
  receiptNumber?: string
  referenceNo?: string
  status: "success" | "pending" | "failed"
  description?: string
}

export default function AccountantPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    amount: "",
    paymentMethod: "cash",
    paymentDate: new Date().toISOString().split("T")[0],
    description: "",
    receiptNumber: "",
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    try {
      const res = await api.getTransactions({
        page: 1,
        limit: 100,
      })
      if (res.status === 1) {
        // Transform the data to match our interface
        const transformedPayments: Payment[] = (res.data || []).map((payment: any) => ({
          id: payment.id,
          studentId: payment.studentId || payment.student_id,
          studentName: payment.studentName || payment.student_name || "Unknown",
          studentCode: payment.studentCode || payment.student_code || "",
          feeId: payment.feeId || payment.fee_id,
          feeType: payment.feeType || payment.fee_type || "General",
          amount: parseFloat(payment.amount) || 0,
          paymentMethod: payment.paymentMethod || payment.payment_method || "cash",
          paymentDate: payment.paymentDate || payment.payment_date || payment.createdAt || "",
          receiptNumber: payment.receiptNumber || payment.receipt_number || "",
          referenceNo: payment.referenceNo || payment.reference_no || "",
          status: payment.status || "success",
          description: payment.description || "",
        }))
        setPayments(transformedPayments)
      } else {
        toast.error(res.message || "Failed to load payments")
      }
    } catch (error: any) {
      console.error("Error fetching payments:", error)
      toast.error("Failed to load payments")
    } finally {
      setLoading(false)
    }
  }

  const handleProcessPayment = async () => {
    if (!formData.studentId || !formData.amount || !formData.paymentDate) {
      toast.error("Please fill all required fields")
      return
    }

    setIsProcessing(true)
    try {
      const res = await api.processPayment({
        studentId: parseInt(formData.studentId),
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        description: formData.description || undefined,
        receiptNumber: formData.receiptNumber || undefined,
      })

      if (res.status === 1) {
        toast.success("Payment processed successfully")
        setIsProcessDialogOpen(false)
        setFormData({
          studentId: "",
          amount: "",
          paymentMethod: "cash",
          paymentDate: new Date().toISOString().split("T")[0],
          description: "",
          receiptNumber: "",
        })
        fetchPayments()
      } else {
        toast.error(res.message || "Failed to process payment")
      }
    } catch (error: any) {
      console.error("Error processing payment:", error)
      toast.error("Failed to process payment")
    } finally {
      setIsProcessing(false)
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

  const getPaymentMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      cash: "bg-green-500",
      upi: "bg-blue-500",
      card: "bg-purple-500",
      netbanking: "bg-orange-500",
      wallet: "bg-pink-500",
      cheque: "bg-gray-500",
    }

    return (
      <Badge className={methodColors[method.toLowerCase()] || "bg-gray-500"}>
        {method.toUpperCase()}
      </Badge>
    )
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.referenceNo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesMethod && matchesStatus
  })

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const todayPayments = filteredPayments.filter(
    (p) => format(new Date(p.paymentDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  )
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0)

  const uniqueMethods = Array.from(new Set(payments.map((p) => p.paymentMethod))).filter(Boolean)

  if (loading) {
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
            <Receipt className="h-8 w-8 text-indigo-600" />
            Payments
          </h2>
          <p className="text-muted-foreground mt-1">Process and manage student payments</p>
        </div>
        <Button onClick={() => setIsProcessDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Process Payment
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">{filteredPayments.length} payment(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Collection</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{todayTotal.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">{todayPayments.length} payment(s)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredPayments.filter((p) => p.status === "success").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredPayments.filter((p) => p.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student, receipt, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {uniqueMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method.toUpperCase()}
                    </SelectItem>
                  ))}
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
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>List of all processed payments</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredPayments.length > 0 ? (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{payment.studentName}</h3>
                        {getStatusBadge(payment.status)}
                        {getPaymentMethodBadge(payment.paymentMethod)}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Code:</span> {payment.studentCode}
                        </div>
                        <div>
                          <span className="font-medium">Fee Type:</span> {payment.feeType}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {payment.paymentDate
                            ? format(new Date(payment.paymentDate), "MMM d, yyyy")
                            : "N/A"}
                        </div>
                        {payment.receiptNumber && (
                          <div>
                            <span className="font-medium">Receipt:</span> {payment.receiptNumber}
                          </div>
                        )}
                      </div>
                      {payment.description && (
                        <p className="text-sm text-muted-foreground mt-2">{payment.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </div>
                      {payment.referenceNo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Ref: {payment.referenceNo}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No payments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Payment Dialog */}
      <Dialog open={isProcessDialogOpen} onOpenChange={setIsProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>Record a new payment for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student ID *</Label>
              <Input
                type="number"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Payment Method *</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="netbanking">Net Banking</SelectItem>
                  <SelectItem value="wallet">Wallet</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Payment Date *</Label>
              <Input
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Receipt Number</Label>
              <Input
                placeholder="Optional receipt number"
                value={formData.receiptNumber}
                onChange={(e) => setFormData({ ...formData, receiptNumber: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleProcessPayment} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Process Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

