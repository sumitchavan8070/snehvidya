"use client"

import { SetStateAction, useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import {
  List,
  CalendarDays,
  Search,
  Plus,
} from "lucide-react"

// Define the data structure for an exam
interface Exam {
  id: number
  name: string
  classId: number
  date: string
  termId: number
  totalMarks: number // Added this field as per the user's request
}

// Mock data to pre-populate the table
const MOCK_EXAMS: Exam[] = [
  { id: 1, name: "Mid-Term Exam 1A", classId: 1, date: "2024-11-15", termId: 1, totalMarks: 100 },
  { id: 2, name: "Final Exam 1A", classId: 1, date: "2025-03-15", termId: 1, totalMarks: 100 },
  { id: 3, name: "Mid-Term Exam 1B", classId: 2, date: "2024-11-16", termId: 1, totalMarks: 100 },
  { id: 4, name: "Final Exam 1B", classId: 2, date: "2025-03-16", termId: 1, totalMarks: 100 },
  { id: 5, name: "Mid-Term Exam 2A", classId: 3, date: "2024-11-17", termId: 1, totalMarks: 100 },
  { id: 6, name: "Final Exam 2A", classId: 3, date: "2025-03-17", termId: 1, totalMarks: 100 },
  { id: 7, name: "Mid-Term Exam 2B", classId: 4, date: "2024-11-18", termId: 1, totalMarks: 100 },
  { id: 8, name: "Final Exam 2B", classId: 4, date: "2025-03-18", termId: 1, totalMarks: 100 },
  { id: 9, name: "Mid-Term Exam 3A", classId: 5, date: "2024-11-19", termId: 1, totalMarks: 100 },
  { id: 10, name: "Final Exam 3A", classId: 5, date: "2025-03-19", termId: 1, totalMarks: 100 },
  { id: 11, name: "Mid-Term Exam 1A MGV", classId: 6, date: "2024-11-20", termId: 2, totalMarks: 100 },
  { id: 12, name: "Final Exam 1A MGV", classId: 6, date: "2025-03-20", termId: 2, totalMarks: 100 },
  { id: 13, name: "Mid-Term Exam 1B MGV", classId: 7, date: "2024-11-21", termId: 2, totalMarks: 100 },
  { id: 14, name: "Final Exam 1B MGV", classId: 7, date: "2025-03-21", termId: 2, totalMarks: 100 },
  { id: 15, name: "Mid-Term Exam 2A MGV", classId: 8, date: "2024-11-22", termId: 2, totalMarks: 100 },
  { id: 16, name: "Final Exam 2A MGV", classId: 8, date: "2025-03-22", termId: 2, totalMarks: 100 },
  { id: 17, name: "Mid-Term Exam 2B MGV", classId: 9, date: "2024-11-23", termId: 2, totalMarks: 100 },
  { id: 18, name: "Final Exam 2B MGV", classId: 9, date: "2025-03-23", termId: 2, totalMarks: 100 },
  { id: 19, name: "Mid-Term Exam 3A MGV", classId: 10, date: "2024-11-24", termId: 2, totalMarks: 100 },
  { id: 20, name: "Final Exam 3A MGV", classId: 10, date: "2025-03-24", termId: 2, totalMarks: 100 },
]

export default function ExamManagement() {
  const [exams, setExams] = useState<Exam[]>(MOCK_EXAMS)
  const [filteredExams, setFilteredExams] = useState<Exam[]>(MOCK_EXAMS)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // Add/Edit Dialog State
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [formData, setFormData] = useState<Partial<Exam>>({})
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  // Apply filters whenever exams or search query changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...exams]
      if (searchQuery) {
        filtered = filtered.filter(
          (exam) =>
            exam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            exam.classId.toString().includes(searchQuery.toLowerCase())
        )
      }
      setFilteredExams(filtered)
    }
    applyFilters()
  }, [exams, searchQuery])

  // Function to open the dialog for a new exam
  const handleAddNew = () => {
    setEditingExam(null)
    setFormData({
      name: "",
      classId: undefined,
      date: "",
      totalMarks: 100,
    })
    setSelectedDate(new Date())
    setDialogOpen(true)
  }

  // Function to handle saving an exam (add or update)
  const handleSave = () => {
    if (!formData.name || !formData.classId || !selectedDate) {
      toast.error("Please fill in all required fields.")
      return
    }

    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const newExam: Exam = {
        id: editingExam ? editingExam.id : exams.length + 1,
        name:"",
        classId: 0,
        date: format(selectedDate, "yyyy-MM-dd"),
        termId: 1, // Mock term ID
        totalMarks: formData.totalMarks || 100,
      }

      if (editingExam) {
        // Update existing exam
        setExams(exams.map((exam) => (exam.id === newExam.id ? newExam : exam)))
        toast.success("Exam updated successfully!")
      } else {
        // Add new exam
        setExams([...exams, newExam])
        toast.success("New exam created successfully!")
      }
      setLoading(false)
      setDialogOpen(false)
    }, 500) // Simulate network latency
  }

  // Calculate stats
  const totalExams = exams.length
  const upcomingExams = exams.filter(
    (exam) => new Date(exam.date) > new Date()
  ).length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Exam Management</h1>
            <p className="text-muted-foreground mt-1">Manage and schedule exams for all classes.</p>
          </div>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Exams</CardTitle>
              <List className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalExams}</div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Exams</CardTitle>
              <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{upcomingExams}</div>
              <p className="text-xs text-muted-foreground mt-1">Exams scheduled in the future</p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Mid-Term Exams</CardTitle>
              <List className="h-5 w-5 text-purple-600 dark:text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {exams.filter((e) => e.name.toLowerCase().includes("mid-term")).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Final Exams</CardTitle>
              <List className="h-5 w-5 text-indigo-600 dark:text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {exams.filter((e) => e.name.toLowerCase().includes("final")).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="relative w-full sm:w-[350px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name or class ID..."
              className="pl-10 w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={handleAddNew}
            className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create New Exam
          </Button>
        </div>

        {/* Exams Table Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Exam Name</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Class ID</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Date</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Total Marks</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading exams...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredExams.length > 0 ? (
                  filteredExams.map((exam, index) => (
                    <TableRow
                      key={exam.id}
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900",
                        "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200 font-medium">
                        {exam.name}
                      </TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">
                        Class {exam.classId}
                      </TableCell>
                      <TableCell className="py-3 text-gray-500 dark:text-gray-400">
                        {format(new Date(exam.date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">
                        {exam.totalMarks}
                      </TableCell>
                      <TableCell className="py-3">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                            new Date(exam.date) > new Date()
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                          )}
                        >
                          {new Date(exam.date) > new Date() ? "Scheduled" : "Completed"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No exams found for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Exam</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Exam Name</label>
                <Input
                  placeholder="e.g., Final Exam 1B"
                  value={formData.name || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Class ID</label>
                <Input
                  type="number"
                  placeholder="e.g., 2"
                  value={formData.classId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, classId: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Total Marks</label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.totalMarks || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, totalMarks: Number(e.target.value) })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Date</label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save Exam"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
