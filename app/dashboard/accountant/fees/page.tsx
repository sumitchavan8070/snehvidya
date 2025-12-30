"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { toast } from "sonner"
import { api } from "@/lib/api"
import {
  DollarSign,
  Search,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Users,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react"
import { format } from "date-fns"

interface Fee {
  id: number
  feeType: string
  amount: number
  paid: number
  pending: number
  status: "pending" | "paid" | "partial"
  dueDate: string
  term?: string
  description?: string
}

interface StudentWithFees {
  studentId: number
  studentName: string
  studentCode: string
  className: string
  rollNumber?: number
  totalFees: number
  totalPaid: number
  totalPending: number
  fees: Fee[]
  overallStatus: "pending" | "paid" | "partial"
}

export default function AccountantFeesPage() {
  const [students, setStudents] = useState<StudentWithFees[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [expandedStudents, setExpandedStudents] = useState<Set<number>>(new Set())

  // Form state
  const [formData, setFormData] = useState({
    studentId: "",
    feeType: "",
    amount: "",
    dueDate: "",
    term: "",
    description: "",
  })

  useEffect(() => {
    fetchStudentsWithFees()
  }, [])

  const fetchStudentsWithFees = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (statusFilter !== "all") params.status = statusFilter
      if (classFilter !== "all") params.class = classFilter
      if (searchTerm) params.search = searchTerm

      const res = await api.getAllStudentsWithFees(params)
      
      if (res.status === 1) {
        // Transform the data to group fees by student
        const studentsMap = new Map<number, StudentWithFees>()
        
        const feesData = res.data || []
        
        feesData.forEach((item: any) => {
          const studentId = item.student_id || item.studentId
          
          if (!studentsMap.has(studentId)) {
            studentsMap.set(studentId, {
              studentId,
              studentName: item.student_name || item.studentName || "Unknown",
              studentCode: item.student_code || item.studentCode || "",
              className: item.class_name || item.className || "",
              rollNumber: item.roll_number || item.rollNumber,
              totalFees: 0,
              totalPaid: 0,
              totalPending: 0,
              fees: [],
              overallStatus: "pending",
            })
          }
          
          const student = studentsMap.get(studentId)!
          const fee: Fee = {
            id: item.id || item.fee_id,
            feeType: item.fee_type || item.feeType || "General",
            amount: parseFloat(item.amount) || 0,
            paid: parseFloat(item.paid) || 0,
            pending: parseFloat(item.pending) || parseFloat(item.amount) || 0,
            status: item.status || "pending",
            dueDate: item.due_date || item.dueDate || "",
            term: item.term || "",
            description: item.description || "",
          }
          
          student.fees.push(fee)
          student.totalFees += fee.amount
          student.totalPaid += fee.paid
          student.totalPending += fee.pending
        })
        
        // Calculate overall status for each student
        studentsMap.forEach((student) => {
          if (student.totalPending === 0) {
            student.overallStatus = "paid"
          } else if (student.totalPaid === 0) {
            student.overallStatus = "pending"
          } else {
            student.overallStatus = "partial"
          }
        })
        
        setStudents(Array.from(studentsMap.values()))
      } else {
        // Fallback: try to get all students and their fees separately
        try {
          const [studentsRes, feesRes] = await Promise.all([
            api.getUsers({ role: "student" }),
            api.getPendingFees(),
          ])
          
          if (studentsRes.status === 1 && feesRes.status === 1) {
            const studentsList = studentsRes.data || []
            const feesList = feesRes.data || []
            
            const studentsMap = new Map<number, StudentWithFees>()
            
            // First, add all students
            studentsList.forEach((student: any) => {
              studentsMap.set(student.id, {
                studentId: student.id,
                studentName: `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Unknown",
                studentCode: student.studentCode || student.code || "",
                className: student.className || student.class_name || "",
                rollNumber: student.rollNumber || student.roll_number,
                totalFees: 0,
                totalPaid: 0,
                totalPending: 0,
                fees: [],
                overallStatus: "pending",
              })
            })
            
            // Then, add fees to students
            feesList.forEach((fee: any) => {
              const studentId = fee.student_id || fee.studentId
              const student = studentsMap.get(studentId)
              
              if (student) {
                const feeObj: Fee = {
                  id: fee.id,
                  feeType: fee.fee_type || fee.feeType || "General",
                  amount: parseFloat(fee.amount) || 0,
                  paid: parseFloat(fee.paid) || 0,
                  pending: parseFloat(fee.pending) || parseFloat(fee.amount) || 0,
                  status: fee.status || "pending",
                  dueDate: fee.due_date || fee.dueDate || "",
                  term: fee.term || "",
                  description: fee.description || "",
                }
                
                student.fees.push(feeObj)
                student.totalFees += feeObj.amount
                student.totalPaid += feeObj.paid
                student.totalPending += feeObj.pending
              }
            })
            
            // Calculate overall status
            studentsMap.forEach((student) => {
              if (student.totalPending === 0 && student.fees.length > 0) {
                student.overallStatus = "paid"
              } else if (student.totalPaid === 0 && student.fees.length > 0) {
                student.overallStatus = "pending"
              } else if (student.fees.length > 0) {
                student.overallStatus = "partial"
              }
            })
            
            setStudents(Array.from(studentsMap.values()))
          } else {
            toast.error(res.message || "Failed to load students and fees")
          }
        } catch (fallbackError) {
          console.error("Fallback error:", fallbackError)
          toast.error("Failed to load students and fees")
        }
      }
    } catch (error: any) {
      console.error("Error fetching students with fees:", error)
      toast.error("Failed to load students and fees")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateFee = async () => {
    if (!formData.studentId || !formData.feeType || !formData.amount || !formData.dueDate) {
      toast.error("Please fill all required fields")
      return
    }

    setIsProcessing(true)
    try {
      const res = await api.createFee({
        school_id: 1,
        student_id: parseInt(formData.studentId),
        fee_type: formData.feeType,
        amount: parseFloat(formData.amount),
        due_date: formData.dueDate,
        term: formData.term || undefined,
      })

      if (res.status === 1) {
        toast.success("Fee created successfully")
        setIsCreateDialogOpen(false)
        setFormData({
          studentId: "",
          feeType: "",
          amount: "",
          dueDate: "",
          term: "",
          description: "",
        })
        fetchStudentsWithFees()
      } else {
        toast.error(res.message || "Failed to create fee")
      }
    } catch (error: any) {
      console.error("Error creating fee:", error)
      toast.error("Failed to create fee")
    } finally {
      setIsProcessing(false)
    }
  }

  const toggleStudentExpanded = (studentId: number) => {
    setExpandedStudents((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        )
      case "partial":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600">
            <Clock className="w-3 h-3 mr-1" />
            Partial
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-red-500 hover:bg-red-600">
            <XCircle className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || student.overallStatus === statusFilter
      const matchesClass = classFilter === "all" || student.className === classFilter

      return matchesSearch && matchesStatus && matchesClass
    })
  }, [students, searchTerm, statusFilter, classFilter])

  const totalPending = filteredStudents.reduce((sum, s) => sum + s.totalPending, 0)
  const totalAmount = filteredStudents.reduce((sum, s) => sum + s.totalFees, 0)
  const totalPaid = filteredStudents.reduce((sum, s) => sum + s.totalPaid, 0)
  const totalStudents = filteredStudents.length

  const uniqueClasses = Array.from(new Set(students.map((s) => s.className))).filter(Boolean)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-indigo-600" />
            Fees Management
          </h2>
          <p className="text-muted-foreground mt-1">Manage student fees and payments</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Fee
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Students with fees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">All fees amount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ₹{totalPending.toLocaleString("en-IN")}
            </div>
            <p className="text-xs text-muted-foreground">
              {filteredStudents.filter((s) => s.overallStatus === "pending").length} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Payment completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students with Fees Cards */}
      <div className="space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => {
            const isExpanded = expandedStudents.has(student.studentId)
            const paymentProgress =
              student.totalFees > 0 ? (student.totalPaid / student.totalFees) * 100 : 0

            return (
              <Card key={student.studentId} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-xl">{student.studentName}</h3>
                        {getStatusBadge(student.overallStatus)}
                        <Badge variant="outline">{student.className}</Badge>
                        {student.rollNumber && (
                          <Badge variant="outline">Roll: {student.rollNumber}</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Code: {student.studentCode}</span>
                        <span>•</span>
                        <span>{student.fees.length} fee(s)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        ₹{student.totalPending.toLocaleString("en-IN")}
                      </div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Summary Row */}
                  <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Fees</p>
                      <p className="text-lg font-semibold">
                        ₹{student.totalFees.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        ₹{student.totalPaid.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-lg font-semibold text-red-600">
                        ₹{student.totalPending.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {student.totalFees > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Payment Progress</span>
                        <span>{Math.round(paymentProgress)}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${paymentProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Fees List */}
                  {student.fees.length > 0 && (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleStudentExpanded(student.studentId)}>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            {isExpanded ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            View {student.fees.length} Fee{student.fees.length > 1 ? "s" : ""}
                          </span>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="mt-4 space-y-3 pt-4 border-t">
                          {student.fees.map((fee) => (
                            <div
                              key={fee.id}
                              className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{fee.feeType}</h4>
                                  {getStatusBadge(fee.status)}
                                  {fee.term && <Badge variant="outline">{fee.term}</Badge>}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">
                                    ₹{fee.amount.toLocaleString("en-IN")}
                                  </p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground">
                                <div>
                                  <span className="font-medium">Due:</span>{" "}
                                  {fee.dueDate
                                    ? format(new Date(fee.dueDate), "MMM d, yyyy")
                                    : "N/A"}
                                </div>
                                <div>
                                  <span className="font-medium">Paid:</span>{" "}
                                  <span className="text-green-600">
                                    ₹{fee.paid.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                <div>
                                  <span className="font-medium">Pending:</span>{" "}
                                  <span className="text-red-600">
                                    ₹{fee.pending.toLocaleString("en-IN")}
                                  </span>
                                </div>
                                {fee.description && (
                                  <div className="col-span-2 md:col-span-1">
                                    <span className="font-medium">Note:</span> {fee.description}
                                  </div>
                                )}
                              </div>
                              {fee.paid > 0 && (
                                <div className="mt-2">
                                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-green-500 transition-all"
                                      style={{
                                        width: `${(fee.paid / fee.amount) * 100}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {student.fees.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p className="text-sm">No fees assigned to this student</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No students found</p>
              <p className="text-sm text-muted-foreground">
                {searchTerm || statusFilter !== "all" || classFilter !== "all"
                  ? "Try adjusting your filters"
                  : "No students with fees found"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Fee Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Fee</DialogTitle>
            <DialogDescription>Add a new fee for a student</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Student ID *</Label>
              <Input
                type="number"
                placeholder="Enter student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Fee Type *</Label>
              <Input
                placeholder="e.g., Tuition, Annual, Exam"
                value={formData.feeType}
                onChange={(e) => setFormData({ ...formData, feeType: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Amount *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date *</Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Term</Label>
              <Input
                placeholder="e.g., Q1, Q2, Q3, Q4"
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="Optional description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFee} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Fee"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
