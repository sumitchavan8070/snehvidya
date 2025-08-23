// "use client"

// import { SetStateAction, useEffect, useState } from "react"
// import Image from "next/image"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Progress } from "@/components/ui/progress"
// import { Users, CalendarIcon, Download, TrendingUp, TrendingDown, CircleCheck, CircleX } from "lucide-react"
// import { format } from "date-fns"
// import { api } from "@/lib/api"
// import { toast } from "sonner"
// import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
// import { Input } from "@/components/ui/input"
// import { cn } from "@/lib/utils"

// // Component for the custom checkbox
// const CustomCheckbox = ({ checked, onChange, className }: { checked: boolean; onChange: () => void; className?: string }) => {
//   return (
//     <div
//       onClick={onChange}
//       className={cn(
//         "h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-colors border-2",
//         checked ? className : "border-gray-300"
//       )}
//     >
//       {checked && <CircleCheck className="h-5 w-5 text-white" />}
//     </div>
//   );
// };

// interface Student {
//   id: number
//   name: string
//   profile: string
//   status: "present" | "absent" | null
//   remarks: string
//   lastUpdated: string
//   attendanceDate: string
// }

// export default function AttendanceManagement() {
//   const [selectedDate, setSelectedDate] = useState<Date>(new Date())
//   const [students, setStudents] = useState<Student[]>([])
//   const [attendanceStats, setAttendanceStats] = useState({
//     total: 0,
//     present: 0,
//     absent: 0,
//     leave: 0,
//     rate: 0,
//   })
//   const [isLoading, setIsLoading] = useState(true);
//   const [allSelected, setAllSelected] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       setIsLoading(true);
//       try {
//         const formattedDate = format(selectedDate, "yyyy-MM-dd");
//         const res = await api.getClassStudents(formattedDate);

//         if (res.status !== 1 || !res.result) {
//           toast.error("Failed to fetch students data.");
//           setAttendanceStats({ total: 0, present: 0, absent: 0, leave: 0, rate: 0 });
//           setStudents([]);
//           return;
//         }

//         const total = res.totalStudents ?? 0;
//         const present = res.presentStudents ?? 0;
//         const absent = res.absentStudents ?? 0;
//         const leave = res.leaveStudents ?? 0;
//         const rate = total > 0 ? Math.round((present / total) * 100) : 0;

//         setAttendanceStats({ total, present, absent, leave, rate });

//         const formatted: Student[] = res.result.map((item: any) => ({
//           id: item.student_id,
//           name: item.student_name,
//           profile: (() => {
//             const [first, last] = item.student_name.split(" ");
//             const initials = `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "JD";
//             return `https://placehold.co/96x96/6366F1/FFFFFF?text=${initials}`;
//           })(),
//           status: item.attendance_status === "present" ? "present" : item.attendance_status === "absent" ? "absent" : null,
//           remarks: item.remarks || "",
//           lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString() : "Not updated yet",
//           attendanceDate: formattedDate,
//         }));

//         setStudents(formatted);
//         toast.success(`Attendance data loaded for ${format(selectedDate, "PPP")}.`);
//       } catch (error) {
//         console.error("Error fetching students:", error);
//         toast.error("An error occurred while fetching students.");
//         setAttendanceStats({ total: 0, present: 0, absent: 0, leave: 0, rate: 0 });
//         setStudents([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [selectedDate]);

//   const toggleStatus = (id: number, status: "present" | "absent") => {
//     setStudents((prev) =>
//       prev.map((s) =>
//         s.id === id
//           ? {
//             ...s,
//             status: s.status === status ? null : status,
//             lastUpdated: new Date().toLocaleTimeString(),
//           }
//           : s
//       )
//     )
//   }

//   const updateRemarks = (id: number, value: string) => {
//     setStudents((prev) =>
//       prev.map((s) =>
//         s.id === id
//           ? {
//             ...s,
//             remarks: value,
//             lastUpdated: new Date().toLocaleTimeString(),
//           }
//           : s
//       )
//     )
//   }

//   const handleSelectAll = () => {
//     const newStatus = allSelected ? null : "present";
//     setStudents((prev) =>
//       prev.map((s) => ({
//         ...s,
//         status: newStatus,
//         lastUpdated: new Date().toLocaleTimeString(),
//       }))
//     );
//     setAllSelected(!allSelected);
//   };

//   const markAttendance = async () => {
//     const today = format(selectedDate, "yyyy-MM-dd");
//     const attendanceList = students
//       .filter((s) => s.status)
//       .map((s) => ({
//         student_id: s.id,
//         date: today,
//         status: s.status,
//         remarks: s.remarks || null,
//       }));

//     if (attendanceList.length === 0) {
//       toast.info("No attendance to mark. Please select at least one student's status.");
//       return;
//     }
//       const rec = {records : attendanceList}; 
//       console.log(rec);

//     try {
//       const res = await api.markBulkAttendance({ records: attendanceList });
      
//       if(res.status == 0){
//         alert("cant perform action buil attedance");
//       }
//       if (res.status === 1) {
//         toast.success(res.message || "Attendance marked successfully");
//       } 
//     } catch (error) {
//       console.error("Error marking attendance:", error);
//       toast.error("An error occurred while marking attendance");
//     }
//   };

//   const updateSingleAttendance = async (student: Student) => {
//     if (!student.status) {
//       toast.error(`Please mark Present or Absent for ${student.name}`);
//       return;
//     }

//     try {
//       const res = await api.markAttendance({
//         student_id: student.id,
//         date: format(selectedDate, "yyyy-MM-dd"),
//         status: student.status,
//         remarks: student.remarks,
//       });

//       if (res.status === 1) {
//         toast.success(`Attendance updated for ${student.name}`);
//         setStudents((prev) =>
//           prev.map((s) =>
//             s.id === student.id
//               ? { ...s, lastUpdated: new Date().toLocaleTimeString() }
//               : s
//           )
//         );
//       } else {
//         toast.error(`Failed to update ${student.name}`);
//       }
//     } catch (error) {
//       console.error("Error updating attendance:", error);
//       toast.error(`Error updating ${student.name}`);
//     }
//   }

//   const attendanceMarkedCount = students.filter(s => s.status !== null).length;
//   const isAttendanceMarked = attendanceMarkedCount > 0;

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
//       <div className="max-w-7xl mx-auto space-y-8">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance Management</h1>
//             <p className="text-muted-foreground mt-1">Monitor and manage student attendance.</p>
//           </div>
//           <div className="flex flex-col sm:flex-row gap-3">
//             <Popover>
//               <PopoverTrigger asChild>
//                 <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-700">
//                   <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
//                   {format(selectedDate, "PPP")}
//                 </Button>
//               </PopoverTrigger>
//               <PopoverContent className="w-auto p-0 z-50">
//                 <Calendar
//                   mode="single"
//                   selected={selectedDate}
//                   onSelect={(date: SetStateAction<Date | undefined>) => date && setSelectedDate(date as Date)}
//                   initialFocus
//                 />
//               </PopoverContent>
//             </Popover>
//             {/* <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105">
//               <Download className="mr-2 h-4 w-4" />
//               Export Report
//             </Button> */}
//           </div>
//         </div>

//         {/* Attendance Stats */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Students Present</CardTitle>
//               <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.present}</div>
//               <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
//             </CardContent>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Rate</CardTitle>
//               <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.rate}%</div>
//               <Progress value={attendanceStats.rate} className="mt-2 h-2" />
//             </CardContent>
//           </Card>

//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Students Absent</CardTitle>
//               <CircleX className="h-5 w-5 text-red-600 dark:text-red-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.absent}</div>
//               <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
//             </CardContent>
//           </Card>
          
//           <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">On Leave</CardTitle>
//               <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.leave}</div>
//               <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Attendance Table */}
//         <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Attendance</h2>
//             <div className="flex gap-2">
//               <Button
//                 onClick={handleSelectAll}
//                 variant="outline"
//                 className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
//               >
//                 {allSelected ? "Deselect All" : "Select All"}
//               </Button>
//               <Button
//                 onClick={markAttendance}
//                 disabled={!isAttendanceMarked || isLoading}
//                 className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
//               >
//                 Mark Attendance
//               </Button>
//             </div>
//           </div>

//           <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
//             <Table>
//               <TableHeader className="bg-gray-50 dark:bg-gray-900">
//                 <TableRow className="border-b border-gray-200 dark:border-gray-700">
//                   <TableHead className="w-[250px] text-gray-500 dark:text-gray-400 font-semibold">Student</TableHead>
//                   <TableHead className="text-center w-[60px] text-gray-500 dark:text-gray-400 font-semibold">Present</TableHead>
//                   <TableHead className="text-center w-[60px] text-gray-500 dark:text-gray-400 font-semibold">Absent</TableHead>
//                   <TableHead className="w-[200px] text-gray-500 dark:text-gray-400 font-semibold">Remarks</TableHead>
//                   <TableHead className="w-[150px] text-gray-500 dark:text-gray-400 font-semibold">Status</TableHead>
//                   <TableHead className="w-[150px] text-gray-500 dark:text-gray-400 font-semibold">Date</TableHead>
//                   <TableHead className="w-[100px] text-gray-500 dark:text-gray-400 font-semibold">Update</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {isLoading ? (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center text-gray-500 py-12">
//                       <div className="flex items-center justify-center space-x-2">
//                         <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                         </svg>
//                         <span>Loading students...</span>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ) : students.length > 0 ? (
//                   students.map((student, index) => (
//                     <TableRow key={student.id} className={cn(
//                       "transition-colors",
//                       index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900",
//                       "hover:bg-gray-100 dark:hover:bg-gray-700"
//                     )}>
//                       <TableCell className="py-4">
//                         <div className="flex items-center gap-3">
//                           <Image
//                             src={student.profile}
//                             alt={student.name}
//                             width={40}
//                             height={40}
//                             className="rounded-full border-2 border-gray-200 dark:border-gray-600"
//                           />
//                           <span className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</span>
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <CustomCheckbox
//                           checked={student.status === "present"}
//                           onChange={() => toggleStatus(student.id, "present")}
//                           className="bg-green-500"
//                         />
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <CustomCheckbox
//                           checked={student.status === "absent"}
//                           onChange={() => toggleStatus(student.id, "absent")}
//                           className="bg-red-500"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Input
//                           type="text"
//                           placeholder="Add remark"
//                           value={student.remarks}
//                           onChange={(e) => updateRemarks(student.id, e.target.value)}
//                           className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
//                         />
//                       </TableCell>
//                       <TableCell className="capitalize font-medium">
//                         <span className={cn(
//                           "px-3 py-1 rounded-full text-xs font-semibold",
//                           student.status === "present" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
//                           student.status === "absent" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
//                           !student.status && "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
//                         )}>
//                           {student.status || "Not marked"}
//                         </span>
//                       </TableCell>
//                       <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
//                         {student.attendanceDate}
//                       </TableCell>
//                       <TableCell>
//                         <Button
//                           size="sm"
//                           variant="secondary"
//                           onClick={() => updateSingleAttendance(student)}
//                           className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
//                         >
//                           Update
//                         </Button>
//                       </TableCell>
//                     </TableRow>
//                   ))
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center text-gray-500 py-12">
//                       No students found for this date.
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client"

import { SetStateAction, useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Users, CalendarIcon, Download, TrendingUp, TrendingDown, CircleCheck, CircleX } from "lucide-react"
import { format } from "date-fns"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// Component for the custom checkbox
const CustomCheckbox = ({ checked, onChange, className }: { checked: boolean; onChange: () => void; className?: string }) => {
  return (
    <div
      onClick={onChange}
      className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-colors border-2",
        checked ? className : "border-gray-300"
      )}
    >
      {checked && <CircleCheck className="h-5 w-5 text-white" />}
    </div>
  );
};

interface Student {
  id: number
  name: string
  profile: string
  status: "present" | "absent" | null
  remarks: string
  lastUpdated: string
  attendanceDate: string
}

export default function AttendanceManagement() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceStats, setAttendanceStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    rate: 0,
  })
  const [isLoading, setIsLoading] = useState(true);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const formattedDate = format(selectedDate, "yyyy-MM-dd");
        const res = await api.getClassStudents(formattedDate);

        if (res.status !== 1 || !res.result) {
          toast.error("Failed to fetch students data.");
          setAttendanceStats({ total: 0, present: 0, absent: 0, leave: 0, rate: 0 });
          setStudents([]);
          return;
        }

        const total = res.totalStudents ?? 0;
        const present = res.presentStudents ?? 0;
        const absent = res.absentStudents ?? 0;
        const leave = res.leaveStudents ?? 0;
        const rate = total > 0 ? Math.round((present / total) * 100) : 0;

        setAttendanceStats({ total, present, absent, leave, rate });

        const formatted: Student[] = res.result.map((item: any) => ({
          id: item.student_id,
          name: item.student_name,
          profile: (() => {
            const [first, last] = item.student_name.split(" ");
            const initials = `${first?.[0] || ""}${last?.[0] || ""}`.toUpperCase() || "JD";
            return `https://placehold.co/96x96/6366F1/FFFFFF?text=${initials}`;
          })(),
          status: item.attendance_status === "present" ? "present" : item.attendance_status === "absent" ? "absent" : null,
          remarks: item.remarks || "",
          lastUpdated: item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString() : "Not updated yet",
          attendanceDate: formattedDate,
        }));

        setStudents(formatted);
        toast.success(`Attendance data loaded for ${format(selectedDate, "PPP")}.`);
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("An error occurred while fetching students.");
        setAttendanceStats({ total: 0, present: 0, absent: 0, leave: 0, rate: 0 });
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    setAllSelected(false);
  }, [selectedDate]);

  const toggleStatus = (id: number, status: "present" | "absent") => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            status: s.status === status ? null : status,
            lastUpdated: new Date().toLocaleTimeString(),
          }
          : s
      )
    )
  }

  const updateRemarks = (id: number, value: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
            ...s,
            remarks: value,
            lastUpdated: new Date().toLocaleTimeString(),
          }
          : s
      )
    )
  }

  const handleSelectAll = () => {
    const newStatus = allSelected ? null : "present";
    setStudents((prev) =>
      prev.map((s) => ({
        ...s,
        status: newStatus,
        lastUpdated: new Date().toLocaleTimeString(),
      }))
    );
    setAllSelected(!allSelected);
  };

  const markAttendance = async () => {
    const today = format(selectedDate, "yyyy-MM-dd");
    const attendanceList = students
      .filter((s) => s.status)
      .map((s) => ({
        student_id: s.id,
        date: today,
        status: s.status,
        remarks: s.remarks || null,
      }));

    if (attendanceList.length === 0) {
      toast.info("No attendance to mark. Please select at least one student's status.");
      return;
    }
      const rec = {records : attendanceList}; 
      console.log(rec);

    try {
      const res = await api.markBulkAttendance({ records: attendanceList });
      
      if(res.status == 0){
        alert("cant perform action buil attedance");
      }
      if (res.status === 1) {
        toast.success(res.message || "Attendance marked successfully");
        window.location.reload(); // Reload the page on success
      } 
    } catch (error) {
      console.error("Error marking attendance:", error);
      toast.error("An error occurred while marking attendance");
    }
  };

  const updateSingleAttendance = async (student: Student) => {
    if (!student.status) {
      toast.error(`Please mark Present or Absent for ${student.name}`);
      return;
    }

    try {
      const res = await api.markAttendance({
        student_id: student.id,
        date: format(selectedDate, "yyyy-MM-dd"),
        status: student.status,
        remarks: student.remarks,
      });

      if (res.status === 1) {
        toast.success(`Attendance updated for ${student.name}`);
        window.location.reload(); // Reload the page on success
      } else {
        toast.error(`Failed to update ${student.name}`);
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error(`Error updating ${student.name}`);
    }
  }

  const attendanceMarkedCount = students.filter(s => s.status !== null).length;
  const isAttendanceMarked = attendanceMarkedCount > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Attendance Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage student attendance.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal border-gray-300 dark:border-gray-700">
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date: SetStateAction<Date | undefined>) => date && setSelectedDate(date as Date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {/* <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button> */}
          </div>
        </div>

        {/* Attendance Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Students Present</CardTitle>
              <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.present}</div>
              <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Attendance Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.rate}%</div>
              <Progress value={attendanceStats.rate} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Students Absent</CardTitle>
              <CircleX className="h-5 w-5 text-red-600 dark:text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.absent}</div>
              <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">On Leave</CardTitle>
              <Users className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{attendanceStats.leave}</div>
              <p className="text-xs text-muted-foreground mt-1">Total: {attendanceStats.total} students</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Attendance</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleSelectAll}
                variant="outline"
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
              <Button
                onClick={markAttendance}
                disabled={!isAttendanceMarked || isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Mark Attendance
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="w-[250px] text-gray-500 dark:text-gray-400 font-semibold">Student</TableHead>
                  <TableHead className="text-center w-[60px] text-gray-500 dark:text-gray-400 font-semibold">Present</TableHead>
                  <TableHead className="text-center w-[60px] text-gray-500 dark:text-gray-400 font-semibold">Absent</TableHead>
                  <TableHead className="w-[200px] text-gray-500 dark:text-gray-400 font-semibold">Remarks</TableHead>
                  <TableHead className="w-[150px] text-gray-500 dark:text-gray-400 font-semibold">Status</TableHead>
                  <TableHead className="w-[150px] text-gray-500 dark:text-gray-400 font-semibold">Date</TableHead>
                  <TableHead className="w-[100px] text-gray-500 dark:text-gray-400 font-semibold">Update</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading students...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : students.length > 0 ? (
                  students.map((student, index) => (
                    <TableRow key={student.id} className={cn(
                      "transition-colors",
                      index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900",
                      "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}>
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={student.profile}
                            alt={student.name}
                            width={40}
                            height={40}
                            className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                          />
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <CustomCheckbox
                          checked={student.status === "present"}
                          onChange={() => toggleStatus(student.id, "present")}
                          className="bg-green-500"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        <CustomCheckbox
                          checked={student.status === "absent"}
                          onChange={() => toggleStatus(student.id, "absent")}
                          className="bg-red-500"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="text"
                          placeholder="Add remark"
                          value={student.remarks}
                          onChange={(e) => updateRemarks(student.id, e.target.value)}
                          className="w-full bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      </TableCell>
                      <TableCell className="capitalize font-medium">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold",
                          student.status === "present" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                          student.status === "absent" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                          !student.status && "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        )}>
                          {student.status || "Not marked"}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-500 dark:text-gray-400 text-sm">
                        {student.attendanceDate}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => updateSingleAttendance(student)}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        >
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-12">
                      No students found for this date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}