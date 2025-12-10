"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, FileText, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function SecurityDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [visitors, setVisitors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const [statsRes, visitorsRes] = await Promise.all([
        api.getSecurityDashboardStats(today),
        api.getVisitors({ date: today, limit: 5 })
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (visitorsRes.status === 1) {
        setVisitors(visitorsRes.data || [])
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
        <h2 className="text-3xl font-bold tracking-tight">Security Dashboard</h2>
        <p className="text-muted-foreground">Monitor visitors and manage security logs</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">Checked in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Visitors</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeVisitors || 0}</div>
            <p className="text-xs text-muted-foreground">Currently on campus</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyIncidents || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entry Logs</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayEntryLogs || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Visitors</CardTitle>
            <CardDescription>Latest visitor entries</CardDescription>
          </CardHeader>
          <CardContent>
            {visitors.length > 0 ? (
              <div className="space-y-4">
                {visitors.map((visitor: any) => (
                  <div key={visitor.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{visitor.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {visitor.purpose || "Visitor"} • {visitor.checkInTime ? formatTime(visitor.checkInTime) : "N/A"}
                      </p>
                    </div>
                    {visitor.status === "checked_in" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No visitors today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common security tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4" />
                <span className="font-medium">Register Visitor</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <ClipboardList className="h-4 w-4" />
                <span className="font-medium">View Entry Logs</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Report Incident</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
