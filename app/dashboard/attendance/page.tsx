"use client"

import { useState, useEffect } from "react"
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
  isAfter,
} from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"

type AttendanceStatus = "present" | "absent" | "late" | "weekend"
type AttendanceRecord = {
  date: Date
  status: AttendanceStatus
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

const statusMap: Record<AttendanceStatus, string> = {
  present: "P",
  absent: "A",
  late: "L",
  weekend: "O",
}

const colorMap: Record<AttendanceStatus | "none", string> = {
  present: "bg-green-100 text-green-700",
  absent: "bg-red-100 text-red-700",
  late: "bg-yellow-100 text-yellow-800",
  weekend: "bg-gray-200 text-gray-600",
  none: "bg-white dark:bg-zinc-800 text-gray-500",
}

const statusDescriptions: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  weekend: "Weekend",
}

export default function StudentAttendanceCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const month = format(currentMonth, "yyyy-MM-01") // Ex: 2024-07-01
        const res = await api.getStaffAttendance(month) // same function works for student

        if (!res || res.status !== 1 || !Array.isArray(res.data)) {
          console.warn("Attendance fetch failed or invalid data format")
          return
        }

        const rawData: AttendanceRecord[] = res.data.map((r: any) => ({
          date: new Date(r.date),
          status: r.status,
        }))

        enrichCalendar(rawData)
      } catch (err) {
        console.error("Failed to load attendance:", err)
      }
    }

    const enrichCalendar = (rawData: AttendanceRecord[]) => {
      const allDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
      })

      const today = new Date()
      const isCurrentMonth =
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear()

      const enriched: AttendanceRecord[] = []

      allDays.forEach(day => {
        if (isAfter(day, today)) return // Skip future dates

        const found = rawData.find(r => isSameDay(r.date, day))

        if (found) {
          enriched.push(found)
        } else {
          const weekday = getDay(day)
          const isWeekend = weekday === 0

          if (isWeekend) {
            enriched.push({ date: day, status: "weekend" })
          } else if (isCurrentMonth) {
            enriched.push({ date: day, status: "absent" })
          }
        }
      })

      setAttendanceRecords(enriched)
    }

    fetchAttendance()
  }, [currentMonth])

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  const getRecordForDay = (day: Date) => {
    return attendanceRecords.find(a => isSameDay(a.date, day))
  }

  const getDayStatus = (day: Date): AttendanceStatus | "none" => {
    const record = getRecordForDay(day)
    return record ? record.status : "none"
  }

  const renderDay = (day: Date) => {
    const status = getDayStatus(day)
    const isSelected = selectedDate && isSameDay(selectedDate, day)

    return (
      <div
        key={day.toString()}
        className={cn(
          "aspect-square border rounded-md flex flex-col items-center justify-center p-1 text-sm cursor-pointer transition-all duration-200",
          colorMap[status],
          isSelected && "ring-2 ring-blue-500 ring-offset-2 scale-105",
          "hover:shadow-md hover:scale-105"
        )}
        onClick={() => setSelectedDate(day)}
      >
        <div className="font-semibold text-xs">{format(day, "d")}</div>
        <div className="text-xl font-bold mt-1">{status !== "none" ? statusMap[status] : ""}</div>
      </div>
    )
  }

  const selectedRecord = selectedDate ? getRecordForDay(selectedDate) : null
  const firstDayOffset = getDay(startOfMonth(currentMonth))

  return (
    <div className="w-full max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 py-8">
      <Card>
        <CardHeader className="flex justify-between items-center px-6 py-4">
          <CardTitle className="text-xl font-bold">{format(currentMonth, "MMMM yyyy")}</CardTitle>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={goToPreviousMonth}><ChevronLeft className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={goToNextMonth}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-4 text-center">
            {DAY_NAMES.map((d) => (
              <div key={d} className="text-xs font-semibold text-gray-500 dark:text-gray-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(firstDayOffset)].map((_, i) => <div key={`empty-${i}`} />)}
            {daysInMonth.map((day) => renderDay(day))}
          </div>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm justify-center">
            {Object.entries(statusDescriptions).map(([key, value]) => (
              <div key={key} className="flex items-center gap-1">
                <span className={cn("inline-block w-4 h-4 rounded-full", colorMap[key as AttendanceStatus])}></span>
                <span>{statusMap[key as AttendanceStatus]} - {value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit sticky top-6">
        <CardHeader className="px-6 py-4">
          <CardTitle className="text-xl font-bold">
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : "Select a date"}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4">
          {selectedRecord ? (
            <div className="space-y-4 text-sm">
              <div>
                <strong className="block text-xs uppercase text-gray-500 dark:text-gray-400">Status</strong>
                <span className={cn("text-lg font-bold", {
                  "text-green-600": selectedRecord.status === "present",
                  "text-red-600": selectedRecord.status === "absent",
                  "text-yellow-600": selectedRecord.status === "late",
                })}>
                  {statusDescriptions[selectedRecord.status]}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm py-4">
              {selectedDate
                ? "No attendance data available for this day."
                : "Please select a day to view its details."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
