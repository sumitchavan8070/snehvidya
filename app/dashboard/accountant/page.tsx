"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, TrendingUp, Receipt, Calculator, Wallet, ArrowUpRight, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function AccountantDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, transactionsRes] = await Promise.all([
        api.getAccountantDashboardStats(),
        api.getRecentTransactions(5)
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (transactionsRes.status === 1) {
        setTransactions(transactionsRes.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Accountant Dashboard</h2>
        <p className="text-muted-foreground">Manage finances and track payments</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              {stats?.revenueChange && stats.revenueChange > 0 && (
                <>
                  <ArrowUpRight className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">+{stats.revenueChange}%</span> from last month
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.pendingPayments?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">From {stats?.pendingPaymentsCount || 0} students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.thisMonthRevenue?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Collected this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.thisMonthTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest payment records</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((txn: any) => (
                  <div key={txn.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{txn.type || "Payment"}</p>
                      <p className="text-sm text-muted-foreground">
                        {txn.studentName ? `${txn.studentName} (ID: ${txn.studentId})` : `Student ID: ${txn.studentId}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">+₹{txn.amount?.toLocaleString() || "0"}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(txn.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common financial tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Process Payment</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Receipt className="h-4 w-4" />
                <span className="font-medium">Generate Invoice</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4" />
                <span className="font-medium">View Reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
