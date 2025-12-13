"use client"

import { SetStateAction, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { UserCheck, Users, CalendarIcon, Search, Download, Filter, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { format, subDays } from "date-fns"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface StaffAttendance {
  id: number
  staffId: number
  name: string
  email: string
  department?: string
  role?: string
  status: "present" | "absent" | "late"
  checkIn?: string
  checkOut?: string
  workingHours?: string
  reason?: string
}

interface StudentAttendanceByClass {
  classId: string
  className: string
  totalStudents: number
  present: number
  absent: number
  attendanceRate: number
}

interface AttendanceStats {
  staff: {
    total: number
    present: number
    absent: number
    late: number
    rate: number
    yesterdayPresent?: number
  }
  students: {
    total: number
    present: number
    absent: number
    rate: number
    yesterdayPresent?: number
  }
}

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [staffAttendance, setStaffAttendance] = useState<StaffAttendance[]>([])
  const [studentAttendance, setStudentAttendance] = useState<StudentAttendanceByClass[]>([])
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats>({
    staff: { total: 0, present: 0, absent: 0, late: 0, rate: 0 },
    students: { total: 0, present: 0, absent: 0, rate: 0 },
  })
  const [departments, setDepartments] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [classDetails, setClassDetails] = useState<any[]>([])
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  useEffect(() => {
    fetchAttendanceData()
  }, [selectedDate])

  useEffect(() => {
    fetchAttendanceStats()
  }, [selectedDate])

  const fetchAttendanceStats = async () => {
    setStatsLoading(true)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const res = await api.getPrincipalAttendanceStats(dateStr)

      if (res.status === 1 || res.data) {
        const data = res.data || res
        setAttendanceStats({
          staff: {
            total: data.staff?.total || 0,
            present: data.staff?.present || 0,
            absent: data.staff?.absent || 0,
            late: data.staff?.late || 0,
            rate: data.staff?.rate || 0,
            yesterdayPresent: data.staff?.yesterdayPresent,
          },
          students: {
            total: data.students?.total || 0,
            present: data.students?.present || 0,
            absent: data.students?.absent || 0,
            rate: data.students?.rate || 0,
            yesterdayPresent: data.students?.yesterdayPresent,
          },
        })
      }
    } catch (error: any) {
      console.error("Error fetching attendance stats:", error)
      toast.error("Failed to load attendance statistics")
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")

      // Fetch staff attendance
      const staffRes = await api.getPrincipalStaffAttendance(dateStr, {
        search: searchTerm || undefined,
        department: selectedDepartment !== "all" ? selectedDepartment : undefined,
      })

      if (staffRes.status === 1 || Array.isArray(staffRes) || staffRes.data) {
        const staffData = staffRes.data || staffRes || []
        setStaffAttendance(staffData)

        // Extract unique departments
        const uniqueDepartments = [...new Set(staffData.map((s: any) => s.department).filter(Boolean))]
        setDepartments(uniqueDepartments)
      }

      // Fetch student attendance by class
      const studentRes = await api.getPrincipalStudentAttendanceByClass(dateStr)

      if (studentRes.status === 1 || Array.isArray(studentRes) || studentRes.data) {
        const studentData = studentRes.data || studentRes || []
        setStudentAttendance(studentData)
      }
    } catch (error: any) {
      console.error("Error fetching attendance data:", error)
      toast.error("Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const handleViewClassDetails = async (classId: string, className: string) => {
    setSelectedClass(className)
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const res = await api.getPrincipalStudentAttendanceDetails(classId, dateStr)

      if (res.status === 1 || Array.isArray(res) || res.data) {
        const details = res.data || res || []
        setClassDetails(details)
        setIsDetailsDialogOpen(true)
      }
    } catch (error: any) {
      console.error("Error fetching class details:", error)
      toast.error("Failed to load class details")
    }
  }

  const handleExportReport = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      // Note: This would typically trigger a file download
      await api.exportPrincipalAttendanceReport(dateStr, "both")
      toast.success("Report export initiated")
    } catch (error: any) {
      console.error("Error exporting report:", error)
      toast.error("Failed to export report")
    }
  }

  const calculateTrend = (current: number, previous?: number) => {
    if (!previous) return null
    const diff = current - previous
    const percent = previous > 0 ? ((diff / previous) * 100).toFixed(1) : "0"
    return { diff, percent, isPositive: diff >= 0 }
  }

  const formatTime = (timeString?: string) => {
    if (!timeString) return "-"
    try {
      // If timeString is already formatted, return as is
      if (timeString.includes("AM") || timeString.includes("PM")) return timeString
      // Otherwise, try to parse and format
      const [hours, minutes] = timeString.split(":")
      const hour = parseInt(hours)
      const ampm = hour >= 12 ? "PM" : "AM"
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minutes} ${ampm}`
    } catch {
      return timeString
    }
  }

  const calculateWorkingHours = (checkIn?: string, checkOut?: string) => {
    if (!checkIn || !checkOut) return "0h 0m"
    try {
      // Parse times and calculate difference
      const [inHour, inMin] = checkIn.split(":").map(Number)
      const [outHour, outMin] = checkOut.split(":").map(Number)
      const inMinutes = inHour * 60 + inMin
      const outMinutes = outHour * 60 + outMin
      const diffMinutes = outMinutes - inMinutes
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return `${hours}h ${minutes}m`
    } catch {
      return "-"
    }
  }

  const filteredStaff = staffAttendance.filter((staff) => {
    const matchesSearch =
      staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const staffTrend = calculateTrend(attendanceStats.staff.present, attendanceStats.staff.yesterdayPresent)
  const studentTrend = calculateTrend(attendanceStats.students.present, attendanceStats.students.yesterdayPresent)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Management</h1>
          <p className="text-muted-foreground">Monitor and manage staff and student attendance</p>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date: SetStateAction<Date>) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleExportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Present</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{attendanceStats.staff.present}</div>
                <p className="text-xs text-muted-foreground">Out of {attendanceStats.staff.total} staff</p>
                {staffTrend && (
                  <div className="flex items-center gap-1 mt-2">
                    {staffTrend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${staffTrend.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {staffTrend.isPositive ? "+" : ""}
                      {staffTrend.percent}% from yesterday
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Present</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{attendanceStats.students.present}</div>
                <p className="text-xs text-muted-foreground">Out of {attendanceStats.students.total} students</p>
                {studentTrend && (
                  <div className="flex items-center gap-1 mt-2">
                    {studentTrend.isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span
                      className={`text-xs ${studentTrend.isPositive ? "text-green-600" : "text-red-600"}`}
                    >
                      {studentTrend.isPositive ? "+" : ""}
                      {studentTrend.percent}% from yesterday
                    </span>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{attendanceStats.staff.rate.toFixed(1)}%</div>
                <Progress value={attendanceStats.staff.rate} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Attendance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <div className="text-2xl font-bold">{attendanceStats.students.rate.toFixed(1)}%</div>
                <Progress value={attendanceStats.students.rate} className="mt-2 h-2" />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Attendance Tables */}
      <Tabs defaultValue="staff" className="space-y-4">
        <TabsList>
          <TabsTrigger value="staff">Staff Attendance</TabsTrigger>
          <TabsTrigger value="students">Student Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Attendance - {format(selectedDate, "PPP")}</CardTitle>
              <CardDescription>Daily attendance tracking for all staff members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search staff members..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      fetchAttendanceData()
                    }}
                    className="pl-8"
                  />
                </div>
                {departments.length > 0 && (
                  <Select
                    value={selectedDepartment}
                    onValueChange={(value) => {
                      setSelectedDepartment(value)
                      fetchAttendanceData()
                    }}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept} value={dept}>
                          {dept}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredStaff.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Working Hours</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id || staff.staffId}>
                          <TableCell className="font-medium">{staff.name}</TableCell>
                          <TableCell>{staff.department || "N/A"}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                staff.status === "present"
                                  ? "default"
                                  : staff.status === "absent"
                                    ? "destructive"
                                    : staff.status === "late"
                                      ? "secondary"
                                      : "outline"
                              }
                            >
                              {staff.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatTime(staff.checkIn)}</TableCell>
                          <TableCell>{formatTime(staff.checkOut)}</TableCell>
                          <TableCell>
                            {staff.workingHours || calculateWorkingHours(staff.checkIn, staff.checkOut)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{staff.reason || "-"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No staff attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Attendance by Class - {format(selectedDate, "PPP")}</CardTitle>
              <CardDescription>Class-wise attendance summary for students</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : studentAttendance.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Total Students</TableHead>
                        <TableHead>Present</TableHead>
                        <TableHead>Absent</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentAttendance.map((classData) => (
                        <TableRow key={classData.classId}>
                          <TableCell className="font-medium">{classData.className}</TableCell>
                          <TableCell>{classData.totalStudents}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              {classData.present}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              {classData.absent}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={classData.attendanceRate} className="w-16 h-2" />
                              <span className="text-sm font-medium">{classData.attendanceRate.toFixed(1)}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewClassDetails(classData.classId, classData.className)}
                            >
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No student attendance records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Class Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedClass} - Student Details</DialogTitle>
            <DialogDescription>Individual student attendance for {format(selectedDate, "PPP")}</DialogDescription>
          </DialogHeader>
          {classDetails.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classDetails.map((student: any, index: number) => (
                    <TableRow key={student.id || index}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.rollNumber || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === "present" ? "default" : "destructive"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{student.remarks || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No student details available</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
