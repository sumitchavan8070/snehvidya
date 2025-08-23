"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Calendar, Trophy, Clock } from "lucide-react"
import { api } from "@/lib/api"

export default function StudentDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats()
        setStats(data)
      } catch (error) {
        console.error("Failed to fetch stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
        <p className="text-muted-foreground">Track your academic progress and activities</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">A-</div>
            <p className="text-xs text-muted-foreground">+0.2 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Due this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Mathematics</p>
                  <p className="text-sm text-muted-foreground">9:00 AM - 10:00 AM • Room 101</p>
                </div>
                <span className="text-green-600 text-sm">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">English Literature</p>
                  <p className="text-sm text-muted-foreground">10:30 AM - 11:30 AM • Room 205</p>
                </div>
                <span className="text-green-600 text-sm">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded bg-blue-50">
                <div>
                  <p className="font-medium">Physics</p>
                  <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM • Lab 1</p>
                </div>
                <span className="text-blue-600 text-sm">Next</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">History</p>
                  <p className="text-sm text-muted-foreground">3:30 PM - 4:30 PM • Room 301</p>
                </div>
                <span className="text-gray-600 text-sm">Upcoming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Assignments</CardTitle>
            <CardDescription>Due this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Math Homework</p>
                  <p className="text-xs text-muted-foreground">Due: Tomorrow</p>
                </div>
                <span className="text-red-600 text-xs">High</span>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Physics Lab Report</p>
                  <p className="text-xs text-muted-foreground">Due: Friday</p>
                </div>
                <span className="text-yellow-600 text-xs">Medium</span>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">History Essay</p>
                  <p className="text-xs text-muted-foreground">Due: Next Week</p>
                </div>
                <span className="text-green-600 text-xs">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
