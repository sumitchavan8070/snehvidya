"use client"

import { useState, useEffect, useRef } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
  DialogDescription,
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
  Loader2,
  Users
} from "lucide-react";
import { api } from "@/lib/api";

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

export default function App() {
  const [currentPage, setCurrentPage] = useState("apply");
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const hasLoadedUserRef = useRef(false);

  // Use useEffect to load user data from local storage on mount
  useEffect(() => {
    // Prevent duplicate calls in React Strict Mode
    if (hasLoadedUserRef.current) {
      return;
    }

    hasLoadedUserRef.current = true;

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
              <CalendarPlus className="h-4 w-4 mr-2" /> Apply Leave
            </Button>
            <Button
              variant={currentPage === "student-pending" ? "default" : "ghost"}
              onClick={() => setCurrentPage("student-pending")}
              className="px-4 py-2 transition-colors duration-200"
            >
              <Users className="h-4 w-4 mr-2" /> Student Leaves
            </Button>
            <Button
              variant={currentPage === "history" ? "default" : "ghost"}
              onClick={() => setCurrentPage("history")}
              className="px-4 py-2 transition-colors duration-200"
            >
              <History className="h-4 w-4 mr-2" /> My History
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
            case "student-pending":
              return <PendingStudentLeavesPage userId={userId} />;
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
  const hasFetchedTypesRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedTypesRef.current) {
      return;
    }

    hasFetchedTypesRef.current = true;

    const fetchLeaveTypes = async () => {
      try {
        const res = await api.getLeaveTypes(userId);
        if (res.status === 1) {
          setLeaveTypes(res.data);
        } else {
          toast.error(res.message || "Failed to fetch leave types.");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch leave types.");
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
        toast.success(res.message || "Leave application submitted successfully");
        setFormData({
          leaveTypeId: "",
          startDate: new Date(),
          endDate: new Date(),
          reason: "",
          medicalCertificate: null,
        });
      } else {
        toast.error(res.message || "Failed to submit leave application.");
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
        const base64String = reader.result as string;
        setFormData({ ...formData, medicalCertificate: base64String });
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

// --- Pending Student Leaves Page (For Teachers) ---
function PendingStudentLeavesPage({ userId }: { userId: number }) {
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState("");
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchPendingLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.getPendingStudentLeaves(userId);
      if (res.status === 1) {
        setPendingLeaves(res.data || []);
      } else {
        toast.error(res.message || "Failed to fetch pending student leaves.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch pending student leaves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    fetchPendingLeaves();
  }, [userId]);

  const handleApprove = async (leaveId: number) => {
    setActionLoading(leaveId);
    try {
      const res = await api.approveRejectStudentLeave(leaveId, {
        userId,
        status: "approved",
      });
      if (res.status === 1) {
        toast.success(res.message || "Student leave approved successfully.");
        fetchPendingLeaves(); // Refresh the list
      } else {
        toast.error(res.message || "Failed to approve leave.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (leaveId: number) => {
    setSelectedLeaveId(leaveId);
    setRejectionReason("");
    setDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedLeaveId) return;

    setActionLoading(selectedLeaveId);
    try {
      const res = await api.approveRejectStudentLeave(selectedLeaveId, {
        userId,
        status: "rejected",
        rejectionReason: rejectionReason || undefined,
      });
      if (res.status === 1) {
        toast.success(res.message || "Student leave rejected successfully.");
        setDialogOpen(false);
        fetchPendingLeaves(); // Refresh the list
      } else {
        toast.error(res.message || "Failed to reject leave.");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle>Pending Student Leave Requests</CardTitle>
          <CardDescription>Review and manage student leave applications from your classes.</CardDescription>
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
                    <TableHead>Student Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLeaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">{leave.studentName}</TableCell>
                      <TableCell>{leave.className}</TableCell>
                      <TableCell>{leave.rollNumber}</TableCell>
                      <TableCell>
                        {`${format(new Date(leave.startDate), "MMM d")} - ${format(new Date(leave.endDate), "MMM d")}`}
                      </TableCell>
                      <TableCell>
                        {Math.ceil(
                          (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / 
                          (1000 * 60 * 60 * 24)
                        ) + 1}
                      </TableCell>
                      <TableCell className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {leave.reason}
                      </TableCell>
                      <TableCell>
                        {format(new Date(leave.appliedDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(leave.id)}
                            disabled={actionLoading === leave.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectClick(leave.id)}
                            disabled={actionLoading === leave.id}
                          >
                            {actionLoading === leave.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No pending student leave requests at this time.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Application</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave application (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Enter reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={actionLoading !== null}>
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Leave"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Leave History Page ---
function LeaveHistoryPage({ userId, staffId }: { userId: number; staffId: number }) {
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate API calls in React Strict Mode
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await api.getStaffLeaveHistory(userId, staffId);
        if (res.status === 1) {
          setHistory(res.data);
        } else {
          toast.error(res.message || "Failed to fetch leave history.");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch leave history.");
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
                    <TableCell>
                      {leave.appliedDate ? format(new Date(leave.appliedDate), "MMM d, yyyy") : "N/A"}
                    </TableCell>
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