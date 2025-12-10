"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Users, FileText, Database, Shield, Activity, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export default function ITAdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await api.getITAdminDashboardStats()
      if (res.status === 1) {
        setStats(res.data)
      } else {
        toast.error(res.message || "Failed to load dashboard stats")
      }
    } catch (error: any) {
      console.error("Error fetching stats:", error)
      toast.error("Failed to load dashboard stats")
    } finally {
      setLoading(false)
    }
  }

  const formatLastBackup = (dateString: string) => {
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
        <h2 className="text-3xl font-bold tracking-tight">IT Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage system settings and user access</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">{stats?.activeUsers || 0} active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className={`h-4 w-4 ${stats?.systemStatus === "online" ? "text-green-600" : "text-red-600"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats?.systemStatus === "online" ? "text-green-600" : "text-red-600"}`}>
              {stats?.systemStatus || "Unknown"}
            </div>
            <p className="text-xs text-muted-foreground">All systems operational</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.storageUsed || 0}%</div>
            <p className="text-xs text-muted-foreground">
              {stats?.storageUsedGB || 0} GB / {stats?.storageTotal || 0} GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.securityAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.securityAlertsPriority || "none"} priority</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Current system status and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Uptime</span>
                <span className="font-medium">{stats?.serverUptime || 0}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active Sessions</span>
                <span className="font-medium">{stats?.activeSessions || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Backup</span>
                <span className="font-medium">
                  {stats?.lastBackup ? formatLastBackup(stats.lastBackup) : "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/it-admin/users">
              <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Manage Users</span>
                </div>
              </div>
            </Link>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4" />
                <span className="font-medium">Backup Database</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">View System Logs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

