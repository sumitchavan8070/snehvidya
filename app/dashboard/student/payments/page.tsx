"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { CreditCard, Calendar, DollarSign, CheckCircle, XCircle, Clock, Receipt, Building2, Package, FileText, Info, History } from "lucide-react"
import RazorpayPaymentButton from "./_components/RazorpayPaymentButton"

interface ExistingFee {
  id: number
  fee_type: string
  term: string
  amount: number
  paid: number
  pending: number
  status: "pending" | "paid" | "partial"
  due_date: string
}

interface Payment {
  id: number
  fee_id: number
  amount: number
  date_paid: string
  method: string
  reference_no: string
}

interface FeesBreakdownData {
  student_id: number
  student_code: string
  student_name: string
  roll_number: number
  class_name: string
  school_id: number
  standard_fees: {
    amount: number
    breakdown: any
  }
  student_services: {
    total: number
    count: number
    services: Array<{
      message?: string
      id?: number
      service_name?: string
      amount?: number
      start_date?: string
      end_date?: string
      notes?: string
    }>
  }
  payment_status: {
    total_fees: number
    total_paid: number
    total_pending: number
    has_paid: boolean
  }
  existing_fees: ExistingFee[]
  payment_history: {
    total_payments: number
    total_amount_paid: number
    payments: Payment[]
    description: string
  }
}

// Safe date formatter that handles invalid dates
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "Invalid Date"
  }
}

const formatDateTime = (dateString: string | null | undefined) => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid Date"
  }
}

export default function StudentPaymentsPage() {
  const [breakdown, setBreakdown] = useState<FeesBreakdownData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "fees" | "history">("overview")

  useEffect(() => {
    const loadFees = async () => {
      try {
        setIsLoading(true)
        const response = await api.getTotalFeesBreakdown()
        
        if (response && response.status === 1 && response.data) {
          setBreakdown(response.data)
        } else {
          toast.error(response?.message || "Failed to load fees")
        }
      } catch (error: any) {
        console.error("Failed to load fees:", error)
        toast.error(error.message || "Failed to load fees")
      } finally {
        setIsLoading(false)
      }
    }

    loadFees()
  }, [])

  const handlePaymentSuccess = async () => {
    // Reload fees after successful payment
    try {
      const response = await api.getTotalFeesBreakdown()
      if (response && response.status === 1 && response.data) {
        setBreakdown(response.data)
        toast.success("Payment successful! Fees updated.")
      }
    } catch (error: any) {
      console.error("Failed to reload fees:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Partial</Badge>
      case "pending":
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="w-3 h-3 mr-1" />Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      upi: "bg-blue-500",
      card: "bg-purple-500",
      cash: "bg-green-500",
      netbanking: "bg-orange-500",
      wallet: "bg-pink-500",
    }

    return (
      <Badge className={methodColors[method.toLowerCase()] || "bg-gray-500"}>
        {method.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <div className="text-muted-foreground">Loading fees...</div>
        </div>
      </div>
    )
  }

  if (!breakdown) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No fees found</p>
          <p className="text-sm text-muted-foreground">You don't have any fees assigned yet.</p>
        </CardContent>
      </Card>
    )
  }

  const unpaidFees = breakdown.existing_fees.filter((f) => f.status !== "paid")
  const paidFees = breakdown.existing_fees.filter((f) => f.status === "paid")
  const paymentProgress = breakdown.payment_status.total_fees > 0
    ? (breakdown.payment_status.total_paid / breakdown.payment_status.total_fees) * 100
    : 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CreditCard className="h-8 w-8 text-indigo-600" />
          Fee Payments
        </h2>
        <p className="text-muted-foreground mt-1">View and pay your school fees online</p>
      </div>

      {/* Student Info Card */}
      <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">{breakdown.student_name}</h3>
              <div className="flex flex-wrap items-center gap-4 text-sm opacity-90">
                <span>Code: {breakdown.student_code}</span>
                <span>Roll: {breakdown.roll_number}</span>
                <span>Class: {breakdown.class_name}</span>
              </div>
            </div>
            <div className="text-right">
              {breakdown.payment_status.total_fees === 0 ? (
                <Badge className="bg-white/20 text-white border-white/30">No Fees</Badge>
              ) : breakdown.payment_status.total_pending === 0 ? (
                <Badge className="bg-green-500 text-white">Fully Paid</Badge>
              ) : breakdown.payment_status.total_paid === 0 ? (
                <Badge className="bg-red-500 text-white">Unpaid</Badge>
              ) : (
                <Badge className="bg-yellow-500 text-white">Partial</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{breakdown.payment_status.total_fees.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakdown.standard_fees.amount > 0 && `Standard: ₹${breakdown.standard_fees.amount.toLocaleString("en-IN")}`}
              {breakdown.student_services.total > 0 && ` • Services: ₹${breakdown.student_services.total.toLocaleString("en-IN")}`}
              {breakdown.existing_fees.length > 0 && ` • Other: ₹${breakdown.existing_fees.reduce((sum, f) => sum + f.amount, 0).toLocaleString("en-IN")}`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{breakdown.payment_status.total_pending.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakdown.payment_status.total_fees > 0 && `${Math.round((breakdown.payment_status.total_pending / breakdown.payment_status.total_fees) * 100)}% of total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{breakdown.payment_status.total_paid.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {breakdown.payment_status.total_fees > 0 && `${Math.round(paymentProgress)}% of total`}
            </p>
            {breakdown.payment_status.total_fees > 0 && (
              <div className="mt-2">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${paymentProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "overview" | "fees" | "history")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fees Details</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Standard Fees */}
          {breakdown.standard_fees.amount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" />
                  Standard Fees Structure
                </CardTitle>
                <CardDescription>Standard fees as per school and class</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">
                  ₹{breakdown.standard_fees.amount.toLocaleString("en-IN")}
                </div>
                {breakdown.standard_fees.breakdown && (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-950/20 rounded-lg">
                    <pre className="text-sm">{JSON.stringify(breakdown.standard_fees.breakdown, null, 2)}</pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Student Services */}
          {breakdown.student_services.count > 0 && breakdown.student_services.services.some(s => s.id) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  Additional Services
                </CardTitle>
                <CardDescription>Additional services added by teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {breakdown.student_services.services.filter(s => s.id).map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{service.service_name}</p>
                        {service.notes && (
                          <p className="text-sm text-muted-foreground">{service.notes}</p>
                        )}
                        {service.start_date && service.end_date && (
                          <p className="text-xs text-muted-foreground">
                            {formatDate(service.start_date)} - {formatDate(service.end_date)}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-semibold">₹{service.amount?.toLocaleString("en-IN")}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total Services</span>
                    <span className="text-xl font-bold text-purple-600">
                      ₹{breakdown.student_services.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Existing Fees Summary */}
          {breakdown.existing_fees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Existing Fees Summary
                </CardTitle>
                <CardDescription>Fees already created and tracked</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold">
                      ₹{breakdown.existing_fees.reduce((sum, f) => sum + f.amount, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Paid</p>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{breakdown.existing_fees.reduce((sum, f) => sum + f.paid, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{breakdown.existing_fees.reduce((sum, f) => sum + f.pending, 0).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {breakdown.existing_fees.length} fee(s) total
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          {/* Unpaid Fees */}
          {unpaidFees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Pending Payments
                </CardTitle>
                <CardDescription>Fees that need to be paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {unpaidFees.map((fee) => {
                    const remainingAmount = fee.pending || (fee.amount - fee.paid)

                    return (
                      <div
                        key={fee.id}
                        className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg">{fee.fee_type}</h3>
                              {getStatusBadge(fee.status)}
                              <Badge variant="outline">{fee.term}</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {formatDate(fee.due_date)}</span>
                              </div>
                              <div>
                                <span className="font-medium">Total:</span> ₹{fee.amount.toLocaleString("en-IN")}
                              </div>
                              {fee.status === "partial" && fee.paid > 0 && (
                                <div>
                                  <span className="font-medium">Paid:</span> ₹{fee.paid.toLocaleString("en-IN")}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Pending:</span> ₹{remainingAmount.toLocaleString("en-IN")}
                              </div>
                            </div>
                            {fee.paid > 0 && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Payment Progress</span>
                                  <span>{Math.round((fee.paid / fee.amount) * 100)}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500 transition-all"
                                    style={{ width: `${(fee.paid / fee.amount) * 100}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <RazorpayPaymentButton
                              fee={fee}
                              amount={remainingAmount}
                              onSuccess={handlePaymentSuccess}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paid Fees */}
          {paidFees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Paid Fees
                </CardTitle>
                <CardDescription>Fees that have been paid</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paidFees.map((fee) => (
                    <div
                      key={fee.id}
                      className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{fee.fee_type}</h3>
                            {getStatusBadge(fee.status)}
                            <Badge variant="outline">{fee.term}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {formatDate(fee.due_date)}</span>
                            </div>
                            <div>
                              <span className="font-medium">Amount:</span> ₹{fee.amount.toLocaleString("en-IN")}
                            </div>
                            <div>
                              <span className="font-medium">Paid:</span> ₹{fee.paid.toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {breakdown.existing_fees.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No existing fees</p>
                <p className="text-sm text-muted-foreground">You don't have any existing fees assigned yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Payment History
              </CardTitle>
              <CardDescription>{breakdown.payment_history.description}</CardDescription>
            </CardHeader>
            <CardContent>
              {breakdown.payment_history.payments.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Payments</p>
                      <p className="text-2xl font-bold">{breakdown.payment_history.total_payments}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount Paid</p>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{breakdown.payment_history.total_amount_paid.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {breakdown.payment_history.payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 bg-white dark:bg-gray-800">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <DollarSign className="h-5 w-5 text-green-600" />
                              <span className="text-xl font-bold">
                                ₹{payment.amount.toLocaleString("en-IN")}
                              </span>
                              {getPaymentMethodBadge(payment.method)}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(payment.date_paid)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Receipt className="h-3 w-3" />
                                <span className="font-mono text-xs">Ref: {payment.reference_no}</span>
                              </div>
                              <div>
                                <span className="font-medium">Fee ID:</span> {payment.fee_id}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No payment history found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
