"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Receipt, Calendar, DollarSign, CreditCard, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Payment {
  id: number
  feeId: number
  amount: number
  datePaid: string
  method: string
  referenceNo: string
}

interface PaymentHistoryProps {
  feeId: number
}

export default function PaymentHistory({ feeId }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPaymentHistory = async () => {
      try {
        setIsLoading(true)
        const response = await api.getPaymentHistory(feeId)
        
        if (response && response.status === 1 && response.data) {
          setPayments(Array.isArray(response.data) ? response.data : [])
        } else {
          setPayments([])
        }
      } catch (error: any) {
        console.error("Failed to load payment history:", error)
        toast.error(error.message || "Failed to load payment history")
        setPayments([])
      } finally {
        setIsLoading(false)
      }
    }

    if (feeId) {
      loadPaymentHistory()
    }
  }, [feeId])

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
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return "Invalid Date"
    }
  }

  const getMethodBadge = (method: string) => {
    const methodColors: Record<string, string> = {
      upi: "bg-blue-500",
      card: "bg-purple-500",
      netbanking: "bg-green-500",
      wallet: "bg-orange-500",
    }

    return (
      <Badge className={methodColors[method.toLowerCase()] || "bg-gray-500"}>
        {method.toUpperCase()}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No payment history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-sm mb-3">Payment History</h4>
      {payments.map((payment) => (
        <Card key={payment.id} className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-semibold text-lg">
                    ₹{payment.amount.toLocaleString("en-IN")}
                  </span>
                  {getMethodBadge(payment.method)}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(payment.datePaid)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span className="font-mono text-xs">{payment.referenceNo}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

