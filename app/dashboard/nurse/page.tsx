"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Stethoscope, Calendar, HeartHandshake, FileText, AlertCircle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

export default function NurseDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const [statsRes, appointmentsRes] = await Promise.all([
        api.getNurseDashboardStats(today),
        api.getTodayAppointments(today)
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (appointmentsRes.status === 1) {
        setAppointments(appointmentsRes.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "h:mm a")
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
        <h2 className="text-3xl font-bold tracking-tight">Nurse/Medical Dashboard</h2>
        <p className="text-muted-foreground">Manage student health records and medical care</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
            <p className="text-xs text-muted-foreground">Scheduled visits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Records</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalHealthRecords?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medications</CardTitle>
            <HeartHandshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeMedications || 0}</div>
            <p className="text-xs text-muted-foreground">Active prescriptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.urgentCases || 0}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Upcoming medical appointments</CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.map((apt: any) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{apt.appointmentType || "Appointment"}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.studentName ? `${apt.studentName} (ID: ${apt.studentId})` : `Student ID: ${apt.studentId}`} • 
                        {apt.scheduledTime ? ` ${formatTime(apt.scheduledTime)}` : " N/A"}
                      </p>
                    </div>
                    {apt.status === "completed" ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No appointments scheduled for today</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common medical tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Stethoscope className="h-4 w-4" />
                <span className="font-medium">Add Health Record</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">Schedule Appointment</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">Generate Health Report</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
