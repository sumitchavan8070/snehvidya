"use client"

import { useState, useEffect, useRef } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock, Loader2, X } from "lucide-react"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils" 

export default function PrincipalDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Get user ID from localStorage
    const userStr = localStorage.getItem("user")
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserId(user.id)
    }
  }, [])

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current || !userId) {
      return
    }

    hasFetchedRef.current = true

    const fetchPendingLeaves = async () => {
      setLoadingLeaves(true)
      try {
        const res = await api.getPendingTeacherLeaves(userId)
        if (res.status === 1) {
          setPendingLeaves(res.data || [])
        } else {
          toast.error(res.message || "Failed to fetch pending leave requests.")
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch pending leave requests.")
      } finally {
        setLoadingLeaves(false)
      }
    }

    fetchPendingLeaves()
  }, [userId])

  const handleApprove = async (leaveId: number) => {
    if (!userId) return

    setActionLoading(leaveId)
    try {
      const res = await api.approveRejectTeacherLeave(leaveId, {
        userId,
        status: "approved",
      })
      if (res.status === 1) {
        toast.success(res.message || "Leave approved successfully.")
        // Remove the approved leave from the list
        setPendingLeaves((prev) => prev.filter((leave) => leave.id !== leaveId))
      } else {
        toast.error(res.message || "Failed to approve leave.")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (leaveId: number) => {
    setSelectedLeaveId(leaveId)
    setRejectionReason("")
    setDialogOpen(true)
  }

  const handleReject = async () => {
    if (!selectedLeaveId || !userId) return

    setActionLoading(selectedLeaveId)
    try {
      const res = await api.approveRejectTeacherLeave(selectedLeaveId, {
        userId,
        status: "rejected",
        rejectionReason: rejectionReason || undefined,
      })
      if (res.status === 1) {
        toast.success(res.message || "Leave rejected successfully.")
        setDialogOpen(false)
        // Remove the rejected leave from the list
        setPendingLeaves((prev) => prev.filter((leave) => leave.id !== selectedLeaveId))
      } else {
        toast.error(res.message || "Failed to reject leave.")
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.")
    } finally {
      setActionLoading(null)
    }
  }

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const stats = [
    {
      title: "Total Staff",
      value: "45",
      change: "+2 this month",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: "1,234",
      change: "+15 this month",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: "$125,000",
      change: "+8% from last month",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Attendance Rate",
      value: "94.5%",
      change: "+1.2% from last week",
      icon: TrendingUp,
      color: "text-purple-600",
    },
  ]

  const recentActivities = [
    {
      id: "1",
      activity: "New teacher registration",
      user: "John Smith",
      time: "2 hours ago",
      type: "success",
    },
    {
      id: "2",
      activity: "Fee payment received",
      user: "Student ID: 1234",
      time: "4 hours ago",
      type: "info",
    },
    {
      id: "3",
      activity: "Leave application submitted",
      user: "Sarah Johnson",
      time: "6 hours ago",
      type: "warning",
    },
  ]

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Principal Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at your school today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pending Leave Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Pending Leave Requests
              </CardTitle>
              <CardDescription>Review and approve teacher leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingLeaves ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p className="text-muted-foreground">Loading leave requests...</p>
                </div>
              ) : pendingLeaves.length > 0 ? (
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <p className="font-medium">{leave.staffName || leave.staffEmail}</p>
                        <p className="text-sm text-muted-foreground">
                          {leave.leaveType} • {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(leave.startDate), "MMM d")} - {format(new Date(leave.endDate), "MMM d, yyyy")}
                        </p>
                        {leave.reason && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                            Reason: {leave.reason}
                          </p>
                        )}
                        {leave.department && (
                          <p className="text-xs text-muted-foreground">
                            Department: {leave.department}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Applied: {format(new Date(leave.appliedDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleApprove(leave.id)}
                          disabled={actionLoading === leave.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {actionLoading === leave.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectClick(leave.id)}
                          disabled={actionLoading === leave.id}
                        >
                          {actionLoading === leave.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pending leave requests at this time.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={`p-1 rounded-full ${
                        activity.type === "success"
                          ? "bg-green-100"
                          : activity.type === "warning"
                            ? "bg-yellow-100"
                            : "bg-blue-100"
                      }`}
                    >
                      {activity.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                      {activity.type === "info" && <Clock className="h-4 w-4 text-blue-600" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{activity.activity}</p>
                      <p className="text-xs text-muted-foreground">{activity.user}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance Overview</CardTitle>
            <CardDescription>Staff and student attendance summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h4 className="font-medium">Staff Attendance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present: 42/45</span>
                    <span>93.3%</span>
                  </div>
                  <Progress value={93.3} className="h-2" />
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present (42)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent (3)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Student Attendance</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present: 1,167/1,234</span>
                    <span>94.5%</span>
                  </div>
                  <Progress value={94.5} className="h-2" />
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Present (1,167)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Absent (67)</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave application (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading !== null}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Leave"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
