"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, CheckCircle, ClipboardList, FileText, CheckSquare, HelpCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { format } from "date-fns"

interface DashboardStats {
  totalStudents: number
  classesCount: number
  subjectsCount: number
  todayClassesCount: number
  todayClasses: Array<{
    id: number
    classId: number
    className: string
    subjectId: number
    subjectName: string
    startTime: string
    endTime: string
    status: 'completed' | 'next' | 'upcoming'
  }>
  subjects: any[]
}

export default function TeacherDashboard() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoadingStats, setIsLoadingStats] = useState(true)
  const [classes, setClasses] = useState<any[]>([])
  const [subjects, setSubjects] = useState<any[]>([])
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true

    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        setIsLoadingStats(true)
        const statsData = await api.getTeacherDashboardStats()
        setStats(statsData)

        // Fetch classes and subjects for display
        try {
          const userStr = localStorage.getItem("user")
          const user = userStr ? JSON.parse(userStr) : null
          const schoolId = user?.school?.id || user?.schoolId || 1

          // Fetch classes
          const classRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://172.23.17.194:8080/api"}/classes?schoolId=${schoolId}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          })
          const classData = await classRes.json()
          if (classData.status === 1) {
            setClasses(classData.data || [])
          }

          // Fetch subjects
          const subjectRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://172.23.17.194:8080/api"}/subjects?schoolId=${schoolId}`, {
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          })
          const subjectData = await subjectRes.json()
          if (subjectData.status === 1) {
            setSubjects(subjectData.data || [])
          }
        } catch (error) {
          console.error("Error fetching classes/subjects:", error)
        }

        // Fetch announcements
        const announcementData = await api.getAnnouncements()
        setAnnouncements(Array.isArray(announcementData) ? announcementData : (announcementData?.data || announcementData?.announcements || []))
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoadingAnnouncements(false)
        setIsLoadingStats(false)
      }
    }

    fetchData()
  }, [])

  const formatTime = (timeStr: string) => {
    if (!timeStr) return ""
    // Parse time string and format it
    const match = timeStr.match(/(\d+):(\d+)/)
    if (match) {
      const hours = parseInt(match[1])
      const minutes = match[2]
      const period = hours >= 12 ? "PM" : "AM"
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
      return `${displayHours}:${minutes} ${period}`
    }
    return timeStr
  }

  const getClassName = (classId: number) => {
    const classItem = classes.find(c => c.id === classId)
    return classItem?.name || classItem?.className || `Class ${classId}`
  }

  const getSubjectName = (subjectId: number) => {
    const subjectItem = subjects.find(s => s.id === subjectId)
    return subjectItem?.name || subjectItem?.subjectName || `Subject ${subjectId}`
  }

  const completedCount = stats?.todayClasses.filter(c => c.status === 'completed').length || 0
  const upcomingCount = stats?.todayClasses.filter(c => c.status === 'upcoming' || c.status === 'next').length || 0

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
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Across {stats?.classesCount || 0} {stats?.classesCount === 1 ? 'class' : 'classes'}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.subjectsCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {subjects.length > 0 
                    ? subjects.slice(0, 3).map(s => s.name || s.subjectName).join(", ")
                    : "No subjects assigned"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <>
                <div className="text-2xl font-bold">{stats?.todayClassesCount || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {completedCount} completed, {upcomingCount} upcoming
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
     

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common teacher tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Link 
              href="/dashboard/teacher/students" 
              className="flex items-center gap-3 p-3 text-sm border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
            >
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Mark Student Attendance</span>
            </Link>
            <Link 
              href="/dashboard/attendance" 
              className="flex items-center gap-3 p-3 text-sm border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
            >
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">My Attendance</span>
            </Link>
            <Link 
              href="/dashboard/teacher/assignments" 
              className="flex items-center gap-3 p-3 text-sm border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Create Assignment</span>
            </Link>
            <Link 
              href="/dashboard/teacher/assignments" 
              className="flex items-center gap-3 p-3 text-sm border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
            >
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Grade Assignments</span>
            </Link>
            <Link 
              href="/dashboard/teacher/support" 
              className="flex items-center gap-3 p-3 text-sm border rounded-lg hover:bg-accent hover:border-accent-foreground/20 transition-colors cursor-pointer"
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Contact Support</span>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Announcements</CardTitle>
            <CardDescription>Latest from school administration</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnnouncements ? (
              <div className="text-sm text-muted-foreground">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-sm text-muted-foreground">No announcements available</div>
            ) : (
              <ul className="space-y-3 text-sm">
                {announcements.map((announcement: any) => {
                  const postedDate = announcement.postedOn 
                    ? new Date(announcement.postedOn).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })
                    : ''
                  
                  const postedBy = announcement.postedBy?.username || announcement.postedBy?.email || 'Admin'
                  
                  return (
                    <li key={announcement.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-semibold text-base mb-1">{announcement.title}</p>
                            <p className="text-muted-foreground text-sm leading-relaxed">{announcement.message}</p>
                          </div>
                          {postedDate && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">{postedDate}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 pt-2 border-t text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Posted by:</span>
                            <span>{postedBy}</span>
                          </div>
                          {announcement.audience && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Audience:</span>
                              <span className="capitalize">{announcement.audience}</span>
                            </div>
                          )}
                          {announcement.schoolName && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">School:</span>
                              <span>{announcement.schoolName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* <Card>
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
        </Card> */}
      </div>
    </div>
  )
}
