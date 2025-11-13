"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, CheckCircle } from "lucide-react"
import { api } from "@/lib/api"

export default function TeacherDashboard() {
  // const [stats, setStats] = useState<any>(null)
  // const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const data = await api.getDashboardStats()
  //       setStats(data)
  //     } catch (error) {
  //       console.error("Failed to fetch stats:", error)
  //     } finally {
  //       setIsLoading(false)
  //     }
  //   }

  //   fetchStats()
  // }, [])

  // if (isLoading) {
  //   return <div>Loading dashboard...</div>
  // }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-muted-foreground">Manage your classes and students</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Across 2 classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Mathematics, Physics, Chemistry</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">2 completed, 2 upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Pending review</p>
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
                  <p className="font-medium">Mathematics - Grade 10A</p>
                  <p className="text-sm text-muted-foreground">9:00 AM - 10:00 AM</p>
                </div>
                <span className="text-green-600 text-sm">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Physics - Grade 11B</p>
                  <p className="text-sm text-muted-foreground">10:30 AM - 11:30 AM</p>
                </div>
                <span className="text-green-600 text-sm">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded bg-blue-50">
                <div>
                  <p className="font-medium">Chemistry - Grade 12A</p>
                  <p className="text-sm text-muted-foreground">2:00 PM - 3:00 PM</p>
                </div>
                <span className="text-blue-600 text-sm">Next</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Mathematics - Grade 11A</p>
                  <p className="text-sm text-muted-foreground">3:30 PM - 4:30 PM</p>
                </div>
                <span className="text-gray-600 text-sm">Upcoming</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common teacher tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <a href="/dashboard/teacher/attendance" className="flex items-center justify-start p-2 text-sm border rounded hover:bg-gray-50">
              Mark Attendance
            </a>
            <a href="/dashboard/teacher/assignments" className="flex items-center justify-start p-2 text-sm border rounded hover:bg-gray-50">
              Create Assignment
            </a>
            <a href="/dashboard/teacher/assignments" className="flex items-center justify-start p-2 text-sm border rounded hover:bg-gray-50">
              Grade Assignments
            </a>
            <a href="/dashboard/teacher/support" className="flex items-center justify-start p-2 text-sm border rounded hover:bg-gray-50">
              Contact Support
            </a>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest from school administration</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start justify-between gap-4 p-3 border rounded">
                <div>
                  <p className="font-medium">PTM scheduled next Friday</p>
                  <p className="text-muted-foreground">Parent-Teacher meeting for Grades 9–12</p>
                </div>
                <span className="text-xs text-gray-500">Nov 10</span>
              </li>
              <li className="flex items-start justify-between gap-4 p-3 border rounded">
                <div>
                  <p className="font-medium">Unit Test timetable published</p>
                  <p className="text-muted-foreground">Check exam section for your subjects</p>
                </div>
                <span className="text-xs text-gray-500">Nov 8</span>
              </li>
              <li className="flex items-start justify-between gap-4 p-3 border rounded">
                <div>
                  <p className="font-medium">Staff meeting at 4 PM</p>
                  <p className="text-muted-foreground">Briefing in auditorium</p>
                </div>
                <span className="text-xs text-gray-500">Today</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Reviews</CardTitle>
            <CardDescription>Assignments awaiting your attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Physics: Worksheet 3</p>
                  <p className="text-muted-foreground">Grade 11B • 12 submissions</p>
                </div>
                <a href="/dashboard/teacher/assignments" className="text-blue-600 text-xs">Review</a>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Chemistry: Lab Report</p>
                  <p className="text-muted-foreground">Grade 12A • 8 submissions</p>
                </div>
                <a href="/dashboard/teacher/assignments" className="text-blue-600 text-xs">Review</a>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="font-medium">Mathematics: Algebra Quiz</p>
                  <p className="text-muted-foreground">Grade 10A • 20 submissions</p>
                </div>
                <a href="/dashboard/teacher/assignments" className="text-blue-600 text-xs">Review</a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
