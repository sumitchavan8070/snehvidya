"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, GraduationCap, DollarSign, Calendar, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"
import DashboardLayout from "@/dashboard-layout" 

export default function PrincipalDashboard() {
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

  const pendingLeaves = [
    {
      id: "1",
      name: "Sarah Johnson",
      type: "Medical Leave",
      duration: "3 days",
      status: "pending",
      date: "2024-01-15",
    },
    {
      id: "2",
      name: "Mike Chen",
      type: "Casual Leave",
      duration: "1 day",
      status: "pending",
      date: "2024-01-18",
    },
    {
      id: "3",
      name: "Emily Davis",
      type: "Emergency Leave",
      duration: "2 days",
      status: "pending",
      date: "2024-01-20",
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
              <CardDescription>Review and approve staff leave applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">{leave.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.type} • {leave.duration}
                      </p>
                      <p className="text-xs text-muted-foreground">{leave.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
    </>
  )
}
