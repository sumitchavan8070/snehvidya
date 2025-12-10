// "use client"

// import { SetStateAction, useEffect, useState } from "react"
// import { format, parseISO } from "date-fns"
// import { toast } from "sonner"
// // import { api } from "@/lib/api" // Uncomment this and configure your API service
// import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
// import { Calendar, Clock, User, Book, Edit, Trash2 } from "lucide-react"
// import { cn } from "@/lib/utils"

// // --- Mock Data & Types ---
// // In a real app, this would be fetched from your backend
// type TimetableEntry = {
//   id: number
//   classId: number
//   subjectId: number
//   teacherId: number
//   startTime: string // ISO 8601 format
//   endTime: string // ISO 8601 format
//   room?: string
// }

// type Class = { id: number; name: string }
// type Subject = { id: number; name: string }
// type Teacher = { id: number; name: string }

// const MOCK_CLASSES: Class[] = [
//   { id: 1, name: "Class 10-A" },
//   { id: 2, name: "Class 10-B" },
//   { id: 3, name: "Class 11-A" },
// ]

// const MOCK_SUBJECTS: Subject[] = [
//   { id: 1, name: "Mathematics" },
//   { id: 2, name: "Physics" },
//   { id: 3, name: "Chemistry" },
//   { id: 4, name: "History" },
// ]

// const MOCK_TEACHERS: Teacher[] = [
//   { id: 1, name: "Mr. Smith" },
//   { id: 2, name: "Ms. Johnson" },
//   { id: 3, name: "Dr. Williams" },
// ]

// const MOCK_TIMETABLES: TimetableEntry[] = [
//   { id: 1, classId: 1, subjectId: 1, teacherId: 1, startTime: "2025-08-22T09:00:00Z", endTime: "2025-08-22T10:00:00Z", room: "A101" },
//   { id: 2, classId: 1, subjectId: 2, teacherId: 2, startTime: "2025-08-22T10:00:00Z", endTime: "2025-08-22T11:00:00Z", room: "A101" },
//   { id: 3, classId: 2, subjectId: 3, teacherId: 3, startTime: "2025-08-22T09:00:00Z", endTime: "2025-08-22T10:00:00Z", room: "B205" },
//   { id: 4, classId: 3, subjectId: 4, teacherId: 1, startTime: "2025-08-23T11:00:00Z", endTime: "2025-08-23T12:00:00Z", room: "C303" },
// ]
// let nextId = MOCK_TIMETABLES.length + 1

// // --- Main Component ---
// export default function TimetableManagement() {
//   const [timetables, setTimetables] = useState<TimetableEntry[]>([])
//   const [filteredTimetables, setFilteredTimetables] = useState<TimetableEntry[]>([])
//   const [loading, setLoading] = useState(false)

//   // Filters
//   const [search, setSearch] = useState("")
//   const [classFilter, setClassFilter] = useState("all")
//   const [teacherFilter, setTeacherFilter] = useState("all")

//   // Add/Edit Dialog
//   const [dialogOpen, setDialogOpen] = useState(false)
//   const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)
//   const [formData, setFormData] = useState<Partial<TimetableEntry>>({})

//   useEffect(() => {
//     fetchTimetables()
//   }, [])

//   useEffect(() => {
//     applyFilters()
//   }, [timetables, search, classFilter, teacherFilter])

//   const fetchTimetables = async () => {
//     setLoading(true)
//     try {
//       // In a real app, replace this with your API call:
//       // const res = await api.getAllTimetables();
//       // setTimetables(res.data)
//       setTimetables(MOCK_TIMETABLES)
//     } catch (error) {
//       console.error(error)
//       toast.error("Error fetching timetable data.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const applyFilters = () => {
//     let filtered = [...timetables]

//     const teachersWithNames = timetables.map(t => ({
//       ...t,
//       teacherName: MOCK_TEACHERS.find(teacher => teacher.id === t.teacherId)?.name,
//       className: MOCK_CLASSES.find(cls => cls.id === t.classId)?.name,
//       subjectName: MOCK_SUBJECTS.find(sub => sub.id === t.subjectId)?.name
//     }))

//     if (search) {
//       filtered = filtered.filter(f => {
//         const entry = teachersWithNames.find(e => e.id === f.id)
//         return entry && (
//           entry.teacherName?.toLowerCase().includes(search.toLowerCase()) ||
//           entry.className?.toLowerCase().includes(search.toLowerCase()) ||
//           entry.subjectName?.toLowerCase().includes(search.toLowerCase())
//         )
//       })
//     }

//     if (classFilter !== "all") {
//       filtered = filtered.filter(f => f.classId === parseInt(classFilter))
//     }

//     if (teacherFilter !== "all") {
//       filtered = filtered.filter(f => f.teacherId === parseInt(teacherFilter))
//     }

//     setFilteredTimetables(filtered)
//   }

//   const handleEdit = (entry: TimetableEntry) => {
//     setEditingEntry(entry)
//     // Format dates to YYYY-MM-DDThh:mm format for input fields
//     const formattedEntry = {
//       ...entry,
//       startTime: format(parseISO(entry.startTime), "yyyy-MM-dd'T'HH:mm"),
//       endTime: format(parseISO(entry.endTime), "yyyy-MM-dd'T'HH:mm")
//     }
//     setFormData(formattedEntry)
//     setDialogOpen(true)
//   }

//   const handleDelete = async (id: number) => {
//     if (!window.confirm("Are you sure you want to delete this timetable entry?")) return
//     try {
//       // Replace with your API call:
//       // await api.deleteTimetableEntry(id);
//       const updatedTimetables = timetables.filter(t => t.id !== id)
//       setTimetables(updatedTimetables)
//       toast.success("Timetable entry deleted successfully.")
//     } catch (error) {
//       toast.error("Error deleting entry.")
//     }
//   }

//   const handleAddNew = () => {
//     setEditingEntry(null)
//     setFormData({})
//     setDialogOpen(true)
//   }

//   const handleSave = async () => {
//     try {
//       if (!formData.classId || !formData.subjectId || !formData.teacherId || !formData.startTime || !formData.endTime) {
//         toast.error("Please fill all required fields.")
//         return
//       }

//       // Convert local date-time strings to ISO format for API
//       const savePayload = {
//         ...formData,
//         startTime: new Date(formData.startTime as string).toISOString(),
//         endTime: new Date(formData.endTime as string).toISOString(),
//       }

//       if (editingEntry) {
//         // Replace with your API call:
//         // await api.updateTimetableEntry(editingEntry.id, savePayload);
//         const updatedTimetables = timetables.map(t =>
//           t.id === editingEntry.id ? { ...t, ...savePayload } : t
//         )
//         setTimetables(updatedTimetables)
//         toast.success("Timetable entry updated successfully.")
//       } else {
//         // Replace with your API call:
//         // await api.createTimetableEntry(savePayload);
//         const newEntry = { id: nextId++, ...savePayload } as TimetableEntry
//         setTimetables([...timetables, newEntry])
//         toast.success("Timetable entry created successfully.")
//       }
//       setDialogOpen(false)
//     } catch (error) {
//       toast.error("Error saving timetable data.")
//     }
//   }

//   const getDayOfWeek = (dateString: string) => {
//     return format(parseISO(dateString), 'EEEE');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Timetable Management</h1>
//             <p className="text-muted-foreground mt-1">Manage and view all class schedules.</p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Button
//               onClick={handleAddNew}
//               className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-lg"
//             >
//               + Add New Entry
//             </Button>
//           </div>
//         </div>

//         {/* Stats Section */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Entries</CardTitle>
//               <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{timetables.length}</div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Classes Scheduled</CardTitle>
//               <Book className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{MOCK_CLASSES.length}</div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Teachers Assigned</CardTitle>
//               <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{MOCK_TEACHERS.length}</div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters and Add Button */}
//         <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
//           <div className="flex-1 flex flex-col sm:flex-row gap-4">
//             <Input
//               placeholder="Search by subject, class, or teacher"
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               className="w-full sm:w-[350px] bg-gray-100 dark:bg-gray-700"
//             />
//             <Select value={classFilter} onValueChange={setClassFilter}>
//               <SelectTrigger className="w-full sm:w-[150px] bg-gray-100 dark:bg-gray-700">
//                 <SelectValue placeholder="Class" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Classes</SelectItem>
//                 {MOCK_CLASSES.map(cls => (
//                   <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select value={teacherFilter} onValueChange={setTeacherFilter}>
//               <SelectTrigger className="w-full sm:w-[150px] bg-gray-100 dark:bg-gray-700">
//                 <SelectValue placeholder="Teacher" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">All Teachers</SelectItem>
//                 {MOCK_TEACHERS.map(teacher => (
//                   <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>

//         {/* Timetable Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
//             <Table>
//               <TableHeader className="bg-gray-50 dark:bg-gray-900">
//                 <TableRow className="border-b border-gray-200 dark:border-gray-700">
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Day</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Class</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Subject</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Teacher</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Start Time</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">End Time</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Room</TableHead>
//                   <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {loading ? (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center text-gray-500 py-12">
//                       <div className="flex items-center justify-center space-x-2">
//                         <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         <span>Loading records...</span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : filteredTimetables.length > 0 ? (
//                   filteredTimetables.map((entry, index) => {
//                     const classItem = MOCK_CLASSES.find(c => c.id === entry.classId)
//                     const subjectItem = MOCK_SUBJECTS.find(s => s.id === entry.subjectId)
//                     const teacherItem = MOCK_TEACHERS.find(t => t.id === entry.teacherId)
//                     return (
//                       <TableRow
//                         key={entry.id}
//                         className={cn(
//                           "transition-colors",
//                           index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900",
//                           "hover:bg-gray-100 dark:hover:bg-gray-700"
//                         )}
//                       >
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{getDayOfWeek(entry.startTime)}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{classItem?.name || "N/A"}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{subjectItem?.name || "N/A"}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{teacherItem?.name || "N/A"}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{format(parseISO(entry.startTime), "hh:mm a")}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{format(parseISO(entry.endTime), "hh:mm a")}</TableCell>
//                         <TableCell className="py-3 text-gray-800 dark:text-gray-200">{entry.room || "N/A"}</TableCell>
//                         <TableCell className="py-3 flex space-x-2">
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={() => handleEdit(entry)}
//                             className="text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
//                           >
//                             <Edit className="h-4 w-4" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             onClick={() => handleDelete(entry.id)}
//                             className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900"
//                           >
//                             <Trash2 className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     )
//                   })
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={8} className="text-center text-gray-500 py-8">
//                       No timetable entries found for the selected filters.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>

//         {/* Add/Edit Dialog */}
//         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//           <DialogContent className="sm:max-w-[425px]">
//             <DialogHeader>
//               <DialogTitle>{editingEntry ? "Edit Timetable Entry" : "Add New Timetable Entry"}</DialogTitle>
//             </DialogHeader>
//             <div className="grid gap-4 py-4">
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Class</label>
//                 <Select
//                   value={formData.classId?.toString() || ""}
//                   onValueChange={(val: string) => setFormData({ ...formData, classId: parseInt(val) })}
//                 >
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select Class" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {MOCK_CLASSES.map(cls => (
//                       <SelectItem key={cls.id} value={cls.id.toString()}>{cls.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Subject</label>
//                 <Select
//                   value={formData.subjectId?.toString() || ""}
//                   onValueChange={(val: string) => setFormData({ ...formData, subjectId: parseInt(val) })}
//                 >
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select Subject" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {MOCK_SUBJECTS.map(sub => (
//                       <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Teacher</label>
//                 <Select
//                   value={formData.teacherId?.toString() || ""}
//                   onValueChange={(val: string) => setFormData({ ...formData, teacherId: parseInt(val) })}
//                 >
//                   <SelectTrigger className="col-span-3">
//                     <SelectValue placeholder="Select Teacher" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {MOCK_TEACHERS.map(teacher => (
//                       <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Room</label>
//                 <Input
//                   placeholder="Room Number"
//                   value={formData.room || ""}
//                   onChange={e => setFormData({ ...formData, room: e.target.value })}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">Start Time</label>
//                 <Input
//                   type="datetime-local"
//                   value={formData.startTime?.toString().slice(0, 16) || ""} // Format for input
//                   onChange={e => setFormData({ ...formData, startTime: e.target.value })}
//                   className="col-span-3"
//                 />
//               </div>
//               <div className="grid grid-cols-4 items-center gap-4">
//                 <label className="text-right">End Time</label>
//                 <Input
//                   type="datetime-local"
//                   value={formData.endTime?.toString().slice(0, 16) || ""} // Format for input
//                   onChange={e => setFormData({ ...formData, endTime: e.target.value })}
//                   className="col-span-3"
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
//               <Button onClick={handleSave}>Save changes</Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </div>
//   )
// }

"use client"

import { useEffect, useState, useRef } from "react"
import { toast } from "sonner"
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableHead,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { api } from "@/lib/api"

// --- Types ---
type TimetableEntry = {
  id: number
  classId: number
  subjectId: number
  teacherId: number
  startTime: string
  endTime: string
  room?: string
}

type Class = { id: number; name: string }
type Subject = { id: number; name: string }
type Teacher = { id: number; name: string }

export default function TimetableManagement() {
  const [timetables, setTimetables] = useState<TimetableEntry[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [teacherFilter, setTeacherFilter] = useState("all")

  // Add/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null)
  const [formData, setFormData] = useState<Partial<TimetableEntry>>({
    classId: undefined,
    subjectId: undefined,
    teacherId: undefined,
    startTime: "",
    endTime: "",
    room: "",
  })

  const schoolId = 1 // Replace with actual school ID
  const hasFetchedRef = useRef(false)

  // --- Fetch all data ---
  const fetchAllData = async () => {
    setLoading(true)
    try {
      // Timetables
const timetableRes = await api.getTimetable();
const timetableData = await timetableRes.json();
if (timetableData.status === 1) {
  setTimetables(
    timetableData.data.map((t: any) => ({
      id: t.id,
      classId: t.classID,
      subjectId: t.subjectId,
      // API response doesn't have a teacherId, so we'll need to handle this.
      // For now, we'll set it to a default or null value.
      teacherId: t.teacherId || null, 
      startTime: t.startTime,
      endTime: t.endTime,
      // API response doesn't have a room, so we'll set it to a default.
      room: t.room || "",
    }))
  );
} else {
  toast.error(timetableData.message);
}
      // Classes
      const classRes = await fetch(
        `http://localhost:5000/classes?schoolId=${schoolId}`
      )
      const classData = await classRes.json()
      if (classData.status === 1) setClasses(classData.data)
      else toast.error(classData.message)

      // Subjects
      const subjectRes = await fetch(
        `http://localhost:5000/subjects?schoolId=${schoolId}`
      )
      const subjectData = await subjectRes.json()
      if (subjectData.status === 1) setSubjects(subjectData.data)
      else toast.error(subjectData.message)

      // Teachers
      const teacherRes = await fetch(
        `http://localhost:5000/users/teachers?schoolId=${schoolId}`
      )
      const teacherData = await teacherRes.json()
      if (teacherData.status === 1) setTeachers(teacherData.data)
      else toast.error(teacherData.message)
    } catch (error) {
      toast.error("Failed to fetch data from server")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return
    }

    hasFetchedRef.current = true
    fetchAllData()
  }, [])

  // --- Add/Edit timetable entry ---
  const handleSave = async () => {
    if (
      !formData.classId ||
      !formData.subjectId ||
      !formData.teacherId ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Please fill all required fields")
      return
    }

    const payload = { ...formData, schoolId }

    try {
      let res
      if (editingEntry) {
        res = await fetch(`http://localhost:5000/timetable/${editingEntry.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        res = await fetch(`http://localhost:5000/timetable`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      }

      const data = await res.json()
      if (data.status === 1) {
        toast.success(data.message)
        fetchAllData()
        setDialogOpen(false)
        setEditingEntry(null)
        setFormData({
          classId: undefined,
          subjectId: undefined,
          teacherId: undefined,
          startTime: "",
          endTime: "",
          room: "",
        })
      } else toast.error(data.message)
    } catch (error) {
      toast.error("Failed to save timetable entry")
      console.error(error)
    }
  }

  // --- Delete ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return
    try {
      const res = await fetch(`http://localhost:5000/timetable/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.status === 1) {
        toast.success(data.message)
        fetchAllData()
      } else toast.error(data.message)
    } catch (error) {
      toast.error("Failed to delete entry")
      console.error(error)
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Timetable Management</CardTitle>
        <Button
          onClick={() => {
            setDialogOpen(true)
            setEditingEntry(null)
            setFormData({
              classId: undefined,
              subjectId: undefined,
              teacherId: undefined,
              startTime: "",
              endTime: "",
              room: "",
            })
          }}
        >
          Add Timetable Entry
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timetables.map(t => (
              <TableRow key={t.id}>
                <TableCell>{classes.find(c => c.id === t.classId)?.name}</TableCell>
                <TableCell>{subjects.find(s => s.id === t.subjectId)?.name}</TableCell>
                <TableCell>{teachers.find(te => te.id === t.teacherId)?.name}</TableCell>
                <TableCell>{t.startTime}</TableCell>
                <TableCell>{t.endTime}</TableCell>
                <TableCell>{t.room || "N/A"}</TableCell>
                <TableCell className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingEntry(t)
                      setFormData(t)
                      setDialogOpen(true)
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Timetable" : "Add Timetable"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Select
              value={formData.classId?.toString() || ""}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, classId: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.subjectId?.toString() || ""}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, subjectId: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s.id} value={s.id.toString()}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={formData.teacherId?.toString() || ""}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, teacherId: Number(value) }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map(te => (
                  <SelectItem key={te.id} value={te.id.toString()}>
                    {te.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="time"
              value={formData.startTime || ""}
              onChange={e =>
                setFormData(prev => ({ ...prev, startTime: e.target.value }))
              }
              placeholder="Start Time"
            />
            <Input
              type="time"
              value={formData.endTime || ""}
              onChange={e =>
                setFormData(prev => ({ ...prev, endTime: e.target.value }))
              }
              placeholder="End Time"
            />
            <Input
              value={formData.room || ""}
              onChange={e => setFormData(prev => ({ ...prev, room: e.target.value }))}
              placeholder="Room (optional)"
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave}>{editingEntry ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
