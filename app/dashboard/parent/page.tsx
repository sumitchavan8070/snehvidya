"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, ClipboardCheck, FileText, Wallet, MessageCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"

export default function ParentDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [children, setChildren] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, childrenRes] = await Promise.all([
        api.getParentDashboardStats(),
        api.getParentChildren()
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (childrenRes.status === 1) {
        setChildren(childrenRes.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
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
        <h2 className="text-3xl font-bold tracking-tight">Parent Dashboard</h2>
        <p className="text-muted-foreground">Monitor your children's academic progress</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Children</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.childrenCount || children.length || 0}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.averageAttendance || 0}%</div>
            <p className="text-xs text-muted-foreground">Average attendance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.pendingFees?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.unreadMessages || 0}</div>
            <p className="text-xs text-muted-foreground">Unread messages</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Children Overview</CardTitle>
            <CardDescription>Your children's current status</CardDescription>
          </CardHeader>
          <CardContent>
            {children.length > 0 ? (
              <div className="space-y-4">
                {children.map((child: any) => (
                  <div key={child.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{child.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Grade {child.grade} • Class {child.className}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{child.attendance || 0}%</p>
                      <p className="text-xs text-muted-foreground">Attendance</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No children found</p>
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
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">View Children</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Check Grades</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Wallet className="h-4 w-4" />
                <span className="font-medium">Pay Fees</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
