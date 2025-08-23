// "use client"

// import { useState, useEffect } from 'react';
// import { format } from "date-fns";
// import { toast } from 'sonner';
// import {
//   Card,
//   CardHeader,
//   CardTitle,
//   CardDescription,
//   CardContent
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Table,
//   TableHeader,
//   TableRow,
//   TableHead,
//   TableBody,
//   TableCell,
// } from "@/components/ui/table";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter
// } from "@/components/ui/dialog";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { cn } from "@/lib/utils";
// import {
//   History,
//   ClipboardList,
//   CalendarPlus,
//   CalendarDays,
//   Check,
//   X,
//   Loader2
// } from "lucide-react";

// // --- User Interface and Dummy Data ---
// // The same User interface you provided, for type-safety.
// interface User {
//   id: number;
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone?: string;
//   bio?: string;
//   country?: string;
//   cityState?: string;
//   postalCode?: string;
//   taxId?: string;
//   role: {
//     id: number;
//     name: string;
//     description: string;
//     isActive: boolean;
//   };
//   school: {
//     id: number;
//     name: string;
//     address: string;
//     phone: string;
//     email: string;
//     website: string;
//     description: string;
//     isActive: boolean;
//   };
// }

// // Dummy data for when local storage is empty or malformed.
// const dummyUser: User = {
//   id: 4, // Using 4 as per your curl request
//   firstName: "Test",
//   lastName: "User",
//   email: "test.user@example.com",
//   role: { id: 1, name: "Staff", description: "", isActive: true },
//   school: { id: 1, name: "Test School", address: "", phone: "", email: "", website: "", description: "", isActive: true },
// };

// // --- API Service to connect to your backend ---
// const API_BASE_URL = "http://172.23.17.239:9090/mobileapi/v1/leaves";
// const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVJZCI6MSwiZW1haWwiOiJwcmluY2lwYWxAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InByaW5jaXBhbC5hZG1pbiIsImlhdCI6MTc1MzM3NjIxOSwiZXhwIjoxNzUzNzM2MjE5fQ.S2R-ROVDyYo26z_UVkpqn5S7HNrtqZXfcAv6hSIMAKs";

// const apiService = {
//   getLeaveTypes: async (userId: number) => {
//     const response = await fetch(`${API_BASE_URL}/types?userId=${userId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   getPendingStaffLeaves: async (userId: number) => {
//     const response = await fetch(`${API_BASE_URL}/staff/pending?userId=${userId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   getStaffLeaveHistory: async (userId: number, staffId: number) => {
//     const response = await fetch(`${API_BASE_URL}/staff/history?userId=${userId}&staffId=${staffId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   applyStaffLeave: async (userId: number, dto: any) => {
//     const response = await fetch(`${API_BASE_URL}/staff/apply`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${AUTH_TOKEN}`
//       },
//       body: JSON.stringify({ ...dto, userId }),
//     });
//     return await response.json();
//   },
//   approveStaffLeave: async (userId: number, leaveId: number, dto: any) => {
//     const response = await fetch(`${API_BASE_URL}/staff/${leaveId}/approve`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${AUTH_TOKEN}`
//       },
//       body: JSON.stringify({ ...dto, userId }),
//     });
//     return await response.json();
//   },
// };

// // --- Main App Component ---
// export default function App() {
//   const [currentPage, setCurrentPage] = useState("apply");
//   const [user, setUser] = useState<User | null>(null);
//   const [loadingUser, setLoadingUser] = useState(true);

//   // Use useEffect to load user data from local storage on mount
//   useEffect(() => {
//     try {
//       const rawUser = localStorage.getItem("user");
//       let parsedUser: User;

//       if (!rawUser) {
//         toast.error("User not found in local storage. Using dummy data.");
//         parsedUser = dummyUser;
//       } else {
//         parsedUser = JSON.parse(rawUser);

//         if (!parsedUser || !parsedUser.firstName) {
//           toast.error("User data is malformed. Using dummy data.");
//           parsedUser = dummyUser;
//         } else {
//           toast.success(`Welcome back, ${parsedUser.firstName}!`);
//         }
//       }
//       setUser(parsedUser);
//     } catch (error) {
//       toast.error("Failed to parse user data from local storage. Using dummy data.");
//       console.error("Error parsing user data:", error);
//       setUser(dummyUser);
//     } finally {
//       setLoadingUser(false);
//     }
//   }, []);

//   // Show a loading state until the user data is ready
//   if (loadingUser || !user) {
//     return (
//       <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
//         <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
//         <p className="ml-2 text-gray-700 dark:text-gray-300">Loading user data...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-10 text-gray-900 dark:text-gray-100">
//       <div className="max-w-4xl mx-auto space-y-8">
//         {/* Header and Navigation */}
//         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//           <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
//           <div className="flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
//             <Button
//               variant={currentPage === "apply" ? "default" : "ghost"}
//               onClick={() => setCurrentPage("apply")}
//               className="px-4 py-2 transition-colors duration-200"
//             >
//               <CalendarPlus className="h-4 w-4 mr-2" /> Apply
//             </Button>
//             <Button
//               variant={currentPage === "pending" ? "default" : "ghost"}
//               onClick={() => setCurrentPage("pending")}
//               className="px-4 py-2 transition-colors duration-200"
//             >
//               <ClipboardList className="h-4 w-4 mr-2" /> Pending
//             </Button>
//             <Button
//               variant={currentPage === "history" ? "default" : "ghost"}
//               onClick={() => setCurrentPage("history")}
//               className="px-4 py-2 transition-colors duration-200"
//             >
//               <History className="h-4 w-4 mr-2" /> History
//             </Button>
//           </div>
//         </div>

//         {/* Dynamic Page Content */}
//         {(() => {
//           // We get the user IDs directly from the loaded user object
//           const userId = user.id;
//           const staffId = user.id;

//           switch (currentPage) {
//             case "apply":
//               return <ApplyLeavePage userId={userId} />;
//             case "pending":
//               return <PendingLeavesPage userId={userId} />;
//             case "history":
//               return <LeaveHistoryPage userId={userId} staffId={staffId} />;
//             default:
//               return <div>Page not found.</div>;
//           }
//         })()}
//       </div>
//     </div>
//   );
// }

// // --- Apply Leave Page ---
// function ApplyLeavePage({ userId }: { userId: number }) {
//   const [formData, setFormData] = useState({
//     leaveTypeId: "",
//     startDate: new Date(),
//     endDate: new Date(),
//     reason: "",
//     medicalCertificate: null,
//   });
//   const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const fetchLeaveTypes = async () => {
//       const res = await apiService.getLeaveTypes(userId);
//       if (res.status === 1) {
//         setLeaveTypes(res.data);
//       } else {
//         toast.error("Failed to fetch leave types.");
//       }
//     };
//     fetchLeaveTypes();
//   }, [userId]);

//   const handleApply = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     const dto = {
//       leaveTypeId: parseInt(formData.leaveTypeId),
//       startDate: format(formData.startDate, "yyyy-MM-dd"),
//       endDate: format(formData.endDate, "yyyy-MM-dd"),
//       reason: formData.reason,
//       medicalCertificate: formData.medicalCertificate,
//     };

//     try {
//       const res = await apiService.applyStaffLeave(userId, dto);
//       if (res.status === 1) {
//         toast.success(res.message);
//         setFormData({
//           leaveTypeId: "",
//           startDate: new Date(),
//           endDate: new Date(),
//           reason: "",
//           medicalCertificate: null,
//         });
//       } else {
//         toast.error("Failed to submit leave application.");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "An error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setFormData({ ...formData,  });
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const selectedLeaveType = leaveTypes.find(
//     (type) => type.id.toString() === formData.leaveTypeId
//   );

//   return (
//     <Card className="bg-white dark:bg-gray-800 shadow-lg">
//       <CardHeader>
//         <CardTitle>Apply for Leave</CardTitle>
//         <CardDescription>Fill out the form to submit your leave application.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleApply} className="space-y-4">
//           <div className="grid w-full items-center gap-2">
//             <Label htmlFor="leaveType">Leave Type</Label>
//             <Select
//               value={formData.leaveTypeId}
//               onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
//               disabled={loading}
//             >
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a leave type" />
//               </SelectTrigger>
//               <SelectContent>
//                 {leaveTypes.map((type) => (
//                   <SelectItem key={type.id} value={type.id.toString()}>
//                     {type.name}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>

//           <div className="grid sm:grid-cols-2 gap-4">
//             <div className="grid w-full items-center gap-2">
//               <Label htmlFor="startDate">Start Date</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant={"outline"}
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !formData.startDate && "text-muted-foreground"
//                     )}
//                   >
//                     <CalendarDays className="mr-2 h-4 w-4" />
//                     {format(formData.startDate, "PPP")}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={formData.startDate}
//                     onSelect={(date) => setFormData({ ...formData, startDate: date || new Date() })}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//             <div className="grid w-full items-center gap-2">
//               <Label htmlFor="endDate">End Date</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant={"outline"}
//                     className={cn(
//                       "w-full justify-start text-left font-normal",
//                       !formData.endDate && "text-muted-foreground"
//                     )}
//                   >
//                     <CalendarDays className="mr-2 h-4 w-4" />
//                     {format(formData.endDate, "PPP")}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0" align="start">
//                   <Calendar
//                     mode="single"
//                     selected={formData.endDate}
//                     onSelect={(date) => setFormData({ ...formData, endDate: date || new Date() })}
//                     initialFocus
//                   />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           <div className="grid w-full items-center gap-2">
//             <Label htmlFor="reason">Reason</Label>
//             <Input
//               id="reason"
//               placeholder="Briefly describe your reason for leave"
//               value={formData.reason}
//               onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
//               disabled={loading}
//             />
//           </div>

//           {selectedLeaveType?.requiresMedicalCertificate && (
//             <div className="grid w-full items-center gap-2">
//               <Label htmlFor="medicalCertificate">Medical Certificate</Label>
//               <Input
//                 id="medicalCertificate"
//                 type="file"
//                 onChange={handleFileChange}
//                 disabled={loading}
//               />
//             </div>
//           )}

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//             Submit Application
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }

// // --- Pending Leaves Page ---
// function PendingLeavesPage({ userId }: { userId: number }) {
//   const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [rejectionReason, setRejectionReason] = useState("");
//   const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
//   const [dialogOpen, setDialogOpen] = useState(false);

//   const fetchPendingLeaves = async () => {
//     setLoading(true);
//     try {
//       const res = await apiService.getPendingStaffLeaves(userId);
//       if (res.status === 1) {
//         setPendingLeaves(res.data);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch pending leaves.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPendingLeaves();
//   }, [userId]);

//   const handleApprove = async (leaveId: number) => {
//     try {
//       const res = await apiService.approveStaffLeave(userId, leaveId, { status: "approved" });
//       if (res.status === 1) {
//         toast.success("Leave approved successfully.");
//         fetchPendingLeaves(); // Refresh the list
//       } else {
//         toast.error("Failed to approve leave.");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "An error occurred.");
//     }
//   };

//   const handleRejectClick = (leaveId: number) => {
//     setSelectedLeaveId(leaveId);
//     setDialogOpen(true);
//   };

//   const handleReject = async () => {
//     if (!rejectionReason.trim()) {
//       toast.error("Please provide a reason for rejection.");
//       return;
//     }
//     setLoading(true);
//     try {
//       const res = await apiService.approveStaffLeave(userId, selectedLeaveId!, {
//         status: "rejected",
//         rejectionReason,
//       });
//       if (res.status === 1) {
//         toast.success("Leave rejected successfully.");
//         setDialogOpen(false);
//         fetchPendingLeaves(); // Refresh the list
//       } else {
//         toast.error("Failed to reject leave.");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "An error occurred.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="bg-white dark:bg-gray-800 shadow-lg">
//       <CardHeader>
//         <CardTitle>Pending Leave Requests</CardTitle>
//         <CardDescription>Review and manage all pending leave applications.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="flex justify-center items-center py-8">
//             <Loader2 className="h-6 w-6 animate-spin mr-2" />
//             <p>Loading requests...</p>
//           </div>
//         ) : pendingLeaves.length > 0 ? (
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Staff Name</TableHead>
//                   <TableHead>Leave Type</TableHead>
//                   <TableHead>Dates</TableHead>
//                   <TableHead>Reason</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {pendingLeaves.map((leave) => (
//                   <TableRow key={leave.id}>
//                     <TableCell className="font-medium">{leave.staffName}</TableCell>
//                     <TableCell>{leave.leaveType}</TableCell>
//                     <TableCell>{`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d")}`}</TableCell>
//                     <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">{leave.reason}</TableCell>
//                     <TableCell className="text-right flex items-center justify-end gap-2">
//                       <Button variant="ghost" size="icon" onClick={() => handleApprove(leave.id)}>
//                         <Check className="h-5 w-5 text-green-500" />
//                       </Button>
//                       <Button variant="ghost" size="icon" onClick={() => handleRejectClick(leave.id)}>
//                         <X className="h-5 w-5 text-red-500" />
//                       </Button>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         ) : (
//           <p className="text-center text-muted-foreground py-8">
//             No pending leave requests at this time.
//           </p>
//         )}
//       </CardContent>

//       {/* Rejection Reason Dialog */}
//       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Reject Leave Application</DialogTitle>
//           </DialogHeader>
//           <div className="grid gap-4 py-4">
//             <div className="grid gap-2">
//               <Label htmlFor="rejectionReason">Reason for Rejection</Label>
//               <Input
//                 id="rejectionReason"
//                 placeholder="e.g., Not enough notice, scheduling conflict"
//                 value={rejectionReason}
//                 onChange={(e) => setRejectionReason(e.target.value)}
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
//             <Button onClick={handleReject} disabled={loading}>
//               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Confirm Reject
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </Card>
//   );
// }

// // --- Leave History Page ---
// function LeaveHistoryPage({ userId, staffId }: { userId: number; staffId: number }) {
//   const [history, setHistory] = useState<any>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchHistory = async () => {
//       setLoading(true);
//       try {
//         const res = await apiService.getStaffLeaveHistory(userId, staffId);
//         if (res.status === 1) {
//           setHistory(res.data);
//         } else {
//           toast.error("Failed to fetch leave history.");
//         }
//       } catch (error) {
//         toast.error("Failed to fetch leave history.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchHistory();
//   }, [userId, staffId]);

//   return (
//     <Card className="bg-white dark:bg-gray-800 shadow-lg">
//       <CardHeader>
//         <CardTitle>Leave History</CardTitle>
//         <CardDescription>A record of all your past leave applications.</CardDescription>
//       </CardHeader>
//       <CardContent>
//         {loading ? (
//           <div className="flex justify-center items-center py-8">
//             <Loader2 className="h-6 w-6 animate-spin mr-2" />
//             <p>Loading history...</p>
//           </div>
//         ) : history && history.leaves.length > 0 ? (
//           <div className="overflow-x-auto">
//             <Table>
//               <TableHeader>
//                 <TableRow>
//                   <TableHead>Type</TableHead>
//                   <TableHead>Dates</TableHead>
//                   <TableHead>Days</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead>Applied On</TableHead>
//                   <TableHead>Approved By</TableHead>
//                   <TableHead>Reason</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {history.leaves.map((leave: any) => (
//                   <TableRow key={leave.id}>
//                     <TableCell className="font-medium">{leave.leaveType}</TableCell>
//                     <TableCell>{`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d")}`}</TableCell>
//                     <TableCell>{leave.totalDays}</TableCell>
//                     <TableCell>
//                       <span className={cn(
//                         "px-2 py-1 rounded-full text-xs font-semibold capitalize",
//                         leave.status === "approved" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
//                         leave.status === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
//                         leave.status === "pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
//                       )}>
//                         {leave.status}
//                       </span>
//                     </TableCell>
//                     <TableCell>{leave.approvedBy || "N/A"}</TableCell>
//                     <TableCell>{leave.reason}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
//         ) : (
//           <p className="text-center text-muted-foreground py-8">
//             No leave history found.
//           </p>
//         )}
//       </CardContent>
//     </Card>
//   );
// }



"use client"

import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  History,
  ClipboardList,
  CalendarPlus,
  CalendarDays,
  Check,
  X,
  Loader2
} from "lucide-react";
import api from '@/api';

// --- User Interface and Dummy Data ---
// The same User interface you provided, for type-safety.
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
  role: {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
  };
  school: {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    isActive: boolean;
  };
}

// --- API Service to connect to your backend ---
const API_BASE_URL = "http://172.23.17.239:9090/mobileapi/v1/leaves";
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInJvbGVJZCI6MSwiZW1haWwiOiJwcmluY2lwYWxAZXhhbXBsZS5jb20iLCJ1c2VybmFtZSI6InByaW5jaXBhbC5hZG1pbiIsImlhdCI6MTc1MzM3NjIxOSwiZXhwIjoxNzUzNzM2MjE5fQ.S2R-ROVDyYo26z_UVkpqn5S7HNrtqZXfcAv6hSIMAKs";

// const apiService = {
//   getLeaveTypes: async (userId: number) => {
//     const response = await fetch(`${API_BASE_URL}/types?userId=${userId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   getPendingStaffLeaves: async (userId: number) => {
//     const response = await fetch(`${API_BASE_URL}/staff/pending?userId=${userId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   getStaffLeaveHistory: async (userId: number, staffId: number) => {
//     const response = await fetch(`${API_BASE_URL}/staff/history?userId=${userId}&staffId=${staffId}`, {
//       headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
//     });
//     return await response.json();
//   },
//   applyStaffLeave: async (userId: number, dto: any) => {
//     const response = await fetch(`${API_BASE_URL}/staff/apply`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${AUTH_TOKEN}`
//       },
//       body: JSON.stringify({ ...dto, userId }),
//     });
//     return await response.json();
//   },
//   approveStaffLeave: async (userId: number, leaveId: number, dto: any) => {
//     const response = await fetch(`${API_BASE_URL}/staff/${leaveId}/approve`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${AUTH_TOKEN}`
//       },
//       body: JSON.stringify({ ...dto, userId }),
//     });
//     return await response.json();
//   },
// };

// --- Main App Component ---
export default function App() {
  const [currentPage, setCurrentPage] = useState("apply");
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Use useEffect to load user data from local storage on mount
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem("user");
      let parsedUser: User | null = null;

      if (!rawUser) {
        toast.error("User not found in local storage. Redirecting to login.");
        // Clear local storage and redirect
        localStorage.clear();
        window.location.href = '/'; // Navigates to the root path
        return; // Stop further execution
      }

      parsedUser = JSON.parse(rawUser);

      if (!parsedUser || !parsedUser.firstName) {
        toast.error("User data is malformed. Redirecting to login.");
        // Clear local storage and redirect
        localStorage.clear();
        window.location.href = '/'; // Navigates to the root path
        return; // Stop further execution
      }

      toast.success(`Welcome back, ${parsedUser.firstName}!`);
      setUser(parsedUser);
    } catch (error) {
      toast.error("Failed to parse user data from local storage. Redirecting to login.");
      console.error("Error parsing user data:", error);
      // Clear local storage and redirect
      localStorage.clear();
      window.location.href = '/'; // Navigates to the root path
    } finally {
      setLoadingUser(false);
    }
  }, []);

  // Show a loading state until the user data is ready
  if (loadingUser || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="ml-2 text-gray-700 dark:text-gray-300">Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-10 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header and Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
          <div className="flex space-x-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg">
            <Button
              variant={currentPage === "apply" ? "default" : "ghost"}
              onClick={() => setCurrentPage("apply")}
              className="px-4 py-2 transition-colors duration-200"
            >
              <CalendarPlus className="h-4 w-4 mr-2" /> Apply
            </Button>
            <Button
              variant={currentPage === "pending" ? "default" : "ghost"}
              onClick={() => setCurrentPage("pending")}
              className="px-4 py-2 transition-colors duration-200"
            >
              <ClipboardList className="h-4 w-4 mr-2" /> Pending
            </Button>
            <Button
              variant={currentPage === "history" ? "default" : "ghost"}
              onClick={() => setCurrentPage("history")}
              className="px-4 py-2 transition-colors duration-200"
            >
              <History className="h-4 w-4 mr-2" /> History
            </Button>
          </div>
        </div>

        {/* Dynamic Page Content */}
        {(() => {
          // We get the user IDs directly from the loaded user object
          const userId = user.id;
          const staffId = user.id;

          switch (currentPage) {
            case "apply":
              return <ApplyLeavePage userId={userId} />;
            case "pending":
              return <PendingLeavesPage userId={userId} />;
            case "history":
              return <LeaveHistoryPage userId={userId} staffId={staffId} />;
            default:
              return <div>Page not found.</div>;
          }
        })()}
      </div>
    </div>
  );
}

// --- Apply Leave Page ---
function ApplyLeavePage({ userId }: { userId: number }) {
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    startDate: new Date(),
    endDate: new Date(),
    reason: "",
    medicalCertificate: null,
  });
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLeaveTypes = async () => {
      const res = await api.getLeaveTypes(userId);
      if (res.status === 1) {
        setLeaveTypes(res.data);
      } else {
        toast.error("Failed to fetch leave types.");
      }
    };
    fetchLeaveTypes();
  }, [userId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dto = {
      leaveTypeId: parseInt(formData.leaveTypeId),
      startDate: format(formData.startDate, "yyyy-MM-dd"),
      endDate: format(formData.endDate, "yyyy-MM-dd"),
      reason: formData.reason,
      medicalCertificate: formData.medicalCertificate,
    };

    try {
      const res = await api.applyStaffLeave(userId, dto);
      if (res.status === 1) {
        toast.success(res.message);
        setFormData({
          leaveTypeId: "",
          startDate: new Date(),
          endDate: new Date(),
          reason: "",
          medicalCertificate: null,
        });
      } else {
        toast.error("Failed to submit leave application.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedLeaveType = leaveTypes.find(
    (type) => type.id.toString() === formData.leaveTypeId
  );

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle>Apply for Leave</CardTitle>
        <CardDescription>Fill out the form to submit your leave application.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleApply} className="space-y-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="leaveType">Leave Type</Label>
            <Select
              value={formData.leaveTypeId}
              onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a leave type" />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => setFormData({ ...formData, startDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {format(formData.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => setFormData({ ...formData, endDate: date || new Date() })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="reason">Reason</Label>
            <Input
              id="reason"
              placeholder="Briefly describe your reason for leave"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              disabled={loading}
            />
          </div>

          {selectedLeaveType?.requiresMedicalCertificate && (
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="medicalCertificate">Medical Certificate</Label>
              <Input
                id="medicalCertificate"
                type="file"
                onChange={handleFileChange}
                disabled={loading}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// --- Pending Leaves Page ---
function PendingLeavesPage({ userId }: { userId: number }) {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingStaffLeaves(userId);
      if (res.status === 1) {
        setPendingLeaves(res.data);
      }
    } catch (error) {
      toast.error("Failed to fetch pending leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLeaves();
  }, [userId]);

  const handleApprove = async (leaveId: number) => {
    try {
      const res = await api.approveStaffLeave(leaveId, { status: "approved" });
      if (res.status === 1) {
        toast.success("Leave approved successfully.");
        fetchPendingLeaves(); // Refresh the list
      } else {
        toast.error("Failed to approve leave.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    }
  };

  const handleRejectClick = (leaveId: number) => {
    setSelectedLeaveId(leaveId);
    setDialogOpen(true);
  };

  // const handleReject = async () => {
  //   if (!rejectionReason.trim()) {
  //     toast.error("Please provide a reason for rejection.");
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     const res = await api.approveStaffLeave(userId, selectedLeaveId!, {
  //       status: "rejected",
  //       rejectionReason,
  //     });
  //     if (res.status === 1) {
  //       toast.success("Leave rejected successfully.");
  //       setDialogOpen(false);
  //       fetchPendingLeaves(); // Refresh the list
  //     } else {
  //       toast.error("Failed to reject leave.");
  //     }
  //   } catch (error: any) {
  //     toast.error(error.message || "An error occurred.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle>Pending Leave Requests</CardTitle>
        <CardDescription>Review and manage all pending leave applications.</CardDescription>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading requests...</p>
          </div>
        ) : pendingLeaves.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.staffName}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>
                      {`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d")}`}
                    </TableCell>
                    <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {leave.reason}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => ({})}
                      >
                        Withdraw
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No pending leave requests at this time.
          </p>
        )}
      </CardContent>

    </Card>
  );
}

// --- Leave History Page ---
function LeaveHistoryPage({ userId, staffId }: { userId: number; staffId: number }) {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.getStaffLeaveHistory(userId, staffId);
        if (res.status === 1) {
          setHistory(res.data);
        } else {
          toast.error("Failed to fetch leave history.");
        }
      } catch (error) {
        toast.error("Failed to fetch leave history.");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId, staffId]);

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg">
      <CardHeader>
        <CardTitle>Leave History</CardTitle>
        <CardDescription>A record of all your past leave applications.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading history...</p>
          </div>
        ) : history && history.leaves.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied On</TableHead>
                  <TableHead>Approved By</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.leaves.map((leave: any) => (
                  <TableRow key={leave.id}>
                    <TableCell className="font-medium">{leave.leaveType}</TableCell>
                    <TableCell>{`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d")}`}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold capitalize",
                        leave.status === "approved" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                        leave.status === "rejected" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                        leave.status === "pending" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                      )}>
                        {leave.status}
                      </span>
                    </TableCell>
                    <TableCell>{leave.approvedBy || "N/A"}</TableCell>
                    <TableCell>{leave.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No leave history found.
          </p>
        )}
      </CardContent>
    </Card>
  );
}