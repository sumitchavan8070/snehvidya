"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, Calendar, CheckCircle, ClipboardList, FileText, CheckSquare, HelpCircle } from "lucide-react"
import { api } from "@/lib/api"

export default function TeacherDashboard() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(true)
  const hasFetchedRef = useRef(false)

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true

    const fetchAnnouncements = async () => {
      try {
        const data = await api.getAnnouncements()
        setAnnouncements(Array.isArray(data) ? data : (data?.data || data?.announcements || []))
      } catch (error) {
        console.error("Failed to fetch announcements:", error)
        setAnnouncements([])
      } finally {
        setIsLoadingAnnouncements(false)
      }
    }

    fetchAnnouncements()
  }, [])

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
