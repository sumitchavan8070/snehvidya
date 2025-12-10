"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, Building, CheckSquare, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function SupportStaffDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, requestsRes] = await Promise.all([
        api.getSupportStaffDashboardStats(),
        api.getMaintenanceRequests({ limit: 5, status: "pending" })
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (requestsRes.status === 1) {
        setRequests(requestsRes.data || [])
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

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      default:
        return "text-gray-600"
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
        <h2 className="text-3xl font-bold tracking-tight">Support Staff Dashboard</h2>
        <p className="text-muted-foreground">Manage maintenance and facilities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeRequests || 0}</div>
            <p className="text-xs text-muted-foreground">Pending tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Tasks completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Facilities</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalFacilities || 0}</div>
            <p className="text-xs text-muted-foreground">Total facilities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.urgentRequests || 0}</div>
            <p className="text-xs text-muted-foreground">High priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Latest maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((req: any) => (
                  <div key={req.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{req.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {req.requestedAt ? formatTime(req.requestedAt) : "N/A"}
                      </p>
                    </div>
                    <span className={`text-sm font-medium ${getPriorityColor(req.priority)}`}>
                      {req.priority || "Normal"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No pending requests</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Wrench className="h-4 w-4" />
                <span className="font-medium">View Requests</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4" />
                <span className="font-medium">Manage Facilities</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-4 w-4" />
                <span className="font-medium">Update Task Status</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
