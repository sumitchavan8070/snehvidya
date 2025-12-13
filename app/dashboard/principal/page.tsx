"use client"

import { useState, useEffect, useRef } from "react"
import { format, formatDistanceToNow } from "date-fns"
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

interface DashboardStats {
  totalStaff: number
  totalStudents: number
  monthlyRevenue: number
  attendanceRate: number
  staffChange?: number
  studentsChange?: number
  revenueChange?: number
  attendanceChange?: number
}

interface RecentActivity {
  id: string
  activity: string
  user: string
  time: string
  type: "success" | "warning" | "info" | "error"
  timestamp: string
}

interface AttendanceOverview {
  staff: {
    present: number
    total: number
    absent: number
    rate: number
  }
  students: {
    present: number
    total: number
    absent: number
    rate: number
  }
}

export default function PrincipalDashboard() {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [userId, setUserId] = useState<number | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loadingActivities, setLoadingActivities] = useState(true)
  const [attendanceOverview, setAttendanceOverview] = useState<AttendanceOverview | null>(null)
  const [loadingAttendance, setLoadingAttendance] = useState(true)
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
    fetchDashboardData()
  }, [])

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current || !userId) {
      return
    }

    hasFetchedRef.current = true
    fetchPendingLeaves()
  }, [userId])

  const fetchDashboardData = async () => {
    // Fetch stats
    setLoadingStats(true)
    try {
      const statsRes = await api.getPrincipalDashboardStats()
      if (statsRes.status === 1 || statsRes.data) {
        const data = statsRes.data || statsRes
        setStats({
          totalStaff: data.totalStaff || 0,
          totalStudents: data.totalStudents || 0,
          monthlyRevenue: data.monthlyRevenue || 0,
          attendanceRate: data.attendanceRate || 0,
          staffChange: data.staffChange,
          studentsChange: data.studentsChange,
          revenueChange: data.revenueChange,
          attendanceChange: data.attendanceChange,
        })
      }
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error)
      toast.error("Failed to load dashboard statistics")
    } finally {
      setLoadingStats(false)
    }

    // Fetch recent activities
    setLoadingActivities(true)
    try {
      const activitiesRes = await api.getPrincipalRecentActivities(10)
      if (activitiesRes.status === 1 || Array.isArray(activitiesRes) || activitiesRes.data) {
        const activities = activitiesRes.data || activitiesRes || []
        setRecentActivities(
          activities.map((activity: any) => ({
            id: activity.id || activity.activityId,
            activity: activity.activity || activity.description || "",
            user: activity.user || activity.userName || activity.userEmail || "",
            time: activity.timestamp
              ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
              : activity.time || "",
            type: activity.type || "info",
            timestamp: activity.timestamp || activity.createdAt || "",
          }))
        )
      }
    } catch (error: any) {
      console.error("Error fetching recent activities:", error)
      // Don't show error toast for activities, just use empty array
    } finally {
      setLoadingActivities(false)
    }

    // Fetch today's attendance overview
    setLoadingAttendance(true)
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const attendanceRes = await api.getPrincipalAttendanceStats(today)
      if (attendanceRes.status === 1 || attendanceRes.data) {
        const data = attendanceRes.data || attendanceRes
        setAttendanceOverview({
          staff: {
            present: data.staff?.present || 0,
            total: data.staff?.total || 0,
            absent: data.staff?.absent || 0,
            rate: data.staff?.rate || 0,
          },
          students: {
            present: data.students?.present || 0,
            total: data.students?.total || 0,
            absent: data.students?.absent || 0,
            rate: data.students?.rate || 0,
          },
        })
      }
    } catch (error: any) {
      console.error("Error fetching attendance overview:", error)
      // Don't show error toast, just use null
    } finally {
      setLoadingAttendance(false)
    }
  }

  const fetchPendingLeaves = async () => {
    setLoadingLeaves(true)
    try {
      const res = await api.getPendingTeacherLeaves(userId!)
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const statsCards = [
    {
      title: "Total Staff",
      value: loadingStats ? "..." : formatNumber(stats?.totalStaff || 0),
      change: stats?.staffChange
        ? `${stats.staffChange > 0 ? "+" : ""}${stats.staffChange} this month`
        : "No change",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Students",
      value: loadingStats ? "..." : formatNumber(stats?.totalStudents || 0),
      change: stats?.studentsChange
        ? `${stats.studentsChange > 0 ? "+" : ""}${stats.studentsChange} this month`
        : "No change",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      title: "Monthly Revenue",
      value: loadingStats ? "..." : formatCurrency(stats?.monthlyRevenue || 0),
      change: stats?.revenueChange
        ? `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange}% from last month`
        : "No change",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Attendance Rate",
      value: loadingStats ? "..." : `${(stats?.attendanceRate || 0).toFixed(1)}%`,
      change: stats?.attendanceChange
        ? `${stats.attendanceChange > 0 ? "+" : ""}${stats.attendanceChange}% from last week`
        : "No change",
      icon: TrendingUp,
      color: "text-purple-600",
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
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {loadingStats ? (
                  <Loader2 className={`h-4 w-4 ${stat.color} animate-spin`} />
                ) : (
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                )}
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
              {loadingActivities ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <p className="text-muted-foreground">Loading activities...</p>
                </div>
              ) : recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`p-1 rounded-full ${
                          activity.type === "success"
                            ? "bg-green-100"
                            : activity.type === "warning"
                              ? "bg-yellow-100"
                              : activity.type === "error"
                                ? "bg-red-100"
                                : "bg-blue-100"
                        }`}
                      >
                        {activity.type === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {activity.type === "warning" && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                        {activity.type === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                        {activity.type === "info" && <Clock className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium">{activity.activity}</p>
                        <p className="text-xs text-muted-foreground">{activity.user}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No recent activities to display.</p>
                </div>
              )}
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
            {loadingAttendance ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p className="text-muted-foreground">Loading attendance data...</p>
              </div>
            ) : attendanceOverview ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">Staff Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Present: {formatNumber(attendanceOverview.staff.present)}/{formatNumber(attendanceOverview.staff.total)}
                      </span>
                      <span>{attendanceOverview.staff.rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendanceOverview.staff.rate} className="h-2" />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Present ({formatNumber(attendanceOverview.staff.present)})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Absent ({formatNumber(attendanceOverview.staff.absent)})</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Student Attendance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        Present: {formatNumber(attendanceOverview.students.present)}/{formatNumber(attendanceOverview.students.total)}
                      </span>
                      <span>{attendanceOverview.students.rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={attendanceOverview.students.rate} className="h-2" />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Present ({formatNumber(attendanceOverview.students.present)})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Absent ({formatNumber(attendanceOverview.students.absent)})</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No attendance data available for today.</p>
              </div>
            )}
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
