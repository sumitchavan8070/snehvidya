"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { 
  Download, 
  Users, 
  TrendingUp, 
  CircleCheck, 
  CircleX, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Calendar,
  CreditCard,
  Package,
  Building2,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ExistingFee {
  id: number
  fee_type: string
  term: string
  amount: number
  paid: number
  pending: number
  status: "pending" | "paid" | "partial"
  due_date: string
}

interface StudentService {
  message?: string
  id?: number
  service_name?: string
  amount?: number
  start_date?: string
  end_date?: string
  notes?: string
}

interface StudentFeesData {
  student_id: number
  student_code: string
  student_name: string
  roll_number: number
  class_name: string
  school_id: number
  standard_fees: {
    amount: number
    breakdown: any
  }
  student_services: {
    total: number
    count: number
    services: StudentService[]
  }
  payment_status: {
    total_fees: number
    total_paid: number
    total_pending: number
    has_paid: boolean
  }
  existing_fees: ExistingFee[]
}

// Safe date formatter that handles invalid dates
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A"
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Invalid Date"
    }
    return format(date, "MMM d, yyyy")
  } catch (error) {
    return "Invalid Date"
  }
}

export default function FeesManagement() {
  const [students, setStudents] = useState<StudentFeesData[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentFeesData[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set())

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFees: 0,
    totalPaid: 0,
    totalPending: 0,
    studentsWithFees: 0,
  })

  useEffect(() => {
    fetchFees()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [students, search, statusFilter, classFilter])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesList()
      if (res.status === 1 && res.result) {
        setStudents(res.result)
        calculateStats(res.result)
      } else {
        toast.error("Failed to fetch fees data.")
        setStudents([])
      }
    } catch (error) {
      console.error(error)
      toast.error("Error fetching data.")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: StudentFeesData[]) => {
    const totalStudents = data.length
    const studentsWithFees = data.filter(s => s.payment_status.total_fees > 0).length
    const totalFees = data.reduce((sum, s) => sum + s.payment_status.total_fees, 0)
    const totalPaid = data.reduce((sum, s) => sum + s.payment_status.total_paid, 0)
    const totalPending = data.reduce((sum, s) => sum + s.payment_status.total_pending, 0)

    setStats({
      totalStudents,
      totalFees,
      totalPaid,
      totalPending,
      studentsWithFees,
    })
  }

  const applyFilters = () => {
    let filtered = [...students]

    if (search) {
      filtered = filtered.filter(s =>
        s.student_name.toLowerCase().includes(search.toLowerCase()) ||
        s.student_code.toLowerCase().includes(search.toLowerCase()) ||
        s.class_name.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(s => s.class_name.toLowerCase() === classFilter.toLowerCase())
    }

    if (statusFilter !== "all") {
      if (statusFilter === "has_fees") {
        filtered = filtered.filter(s => s.payment_status.total_fees > 0)
      } else if (statusFilter === "no_fees") {
        filtered = filtered.filter(s => s.payment_status.total_fees === 0)
      } else if (statusFilter === "fully_paid") {
        filtered = filtered.filter(s => s.payment_status.total_pending === 0 && s.payment_status.total_fees > 0)
      } else if (statusFilter === "has_pending") {
        filtered = filtered.filter(s => s.payment_status.total_pending > 0)
      }
    }

    setFilteredStudents(filtered)
  }

  const toggleCard = (studentId: number) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId)
    } else {
      newExpanded.add(studentId)
    }
    setExpandedCards(newExpanded)
  }

  const getPaymentStatusBadge = (student: StudentFeesData) => {
    if (student.payment_status.total_fees === 0) {
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">No Fees</Badge>
    }
    if (student.payment_status.total_pending === 0) {
      return <Badge className="bg-green-500 hover:bg-green-600"><CircleCheck className="w-3 h-3 mr-1" />Fully Paid</Badge>
    }
    if (student.payment_status.total_paid === 0) {
      return <Badge className="bg-red-500 hover:bg-red-600"><CircleX className="w-3 h-3 mr-1" />Unpaid</Badge>
    }
    return <Badge className="bg-yellow-500 hover:bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Partial</Badge>
  }

  const getFeeStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>
      case "partial":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Partial</Badge>
      case "pending":
        return <Badge className="bg-red-500 hover:bg-red-600">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Student Fees Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all student fee records.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Students</CardTitle>
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Fees</CardTitle>
              <DollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">₹{stats.totalFees.toLocaleString("en-IN")}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Paid</CardTitle>
              <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">₹{stats.totalPaid.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalFees > 0 ? `${Math.round((stats.totalPaid / stats.totalFees) * 100)}%` : "0%"}
              </p>
              <Progress value={stats.totalFees > 0 ? (stats.totalPaid / stats.totalFees) * 100 : 0} className="mt-2 h-2 [&>*]:bg-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pending</CardTitle>
              <CircleX className="h-5 w-5 text-red-600 dark:text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">₹{stats.totalPending.toLocaleString("en-IN")}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalFees > 0 ? `${Math.round((stats.totalPending / stats.totalFees) * 100)}%` : "0%"}
              </p>
              <Progress value={stats.totalFees > 0 ? (stats.totalPending / stats.totalFees) * 100 : 0} className="mt-2 h-2 [&>*]:bg-red-500" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">With Fees</CardTitle>
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.studentsWithFees}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.totalStudents > 0 ? `${Math.round((stats.studentsWithFees / stats.totalStudents) * 100)}%` : "0%"} of students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by student name, code, or class"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full sm:w-[350px] bg-gray-100 dark:bg-gray-700"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-gray-100 dark:bg-gray-700">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="has_fees">Has Fees</SelectItem>
                <SelectItem value="no_fees">No Fees</SelectItem>
                <SelectItem value="fully_paid">Fully Paid</SelectItem>
                <SelectItem value="has_pending">Has Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-gray-100 dark:bg-gray-700">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[...new Set(students.map(s => s.class_name))].map(cls => (
                  <SelectItem key={cls} value={cls.toLowerCase()}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Student Cards */}
        <div className="space-y-4">
                {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                  <span className="text-gray-500">Loading records...</span>
                </div>
              </CardContent>
            </Card>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const isExpanded = expandedCards.has(student.student_id)
              const paymentProgress = student.payment_status.total_fees > 0
                ? (student.payment_status.total_paid / student.payment_status.total_fees) * 100
                : 0

              return (
                <Card key={student.student_id} className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{student.student_name}</h3>
                          {getPaymentStatusBadge(student)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {student.student_code}
                          </span>
                          <span>Roll: {student.roll_number}</span>
                          <span>Class: {student.class_name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Total Fees</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            ₹{student.payment_status.total_fees.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleCard(student.student_id)}>
                          <CollapsibleTrigger asChild>
                            <Button variant="outline" size="sm">
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-4 w-4 mr-1" />
                                  Hide Details
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-4 w-4 mr-1" />
                                  View Details
                                </>
                              )}
                        </Button>
                          </CollapsibleTrigger>
                        </Collapsible>
          </div>
        </div>

                    {/* Payment Summary */}
                    {student.payment_status.total_fees > 0 && (
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Payment Progress</span>
                          <span className="font-semibold">
                            ₹{student.payment_status.total_paid.toLocaleString("en-IN")} / ₹{student.payment_status.total_fees.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <Progress value={paymentProgress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="text-green-600">Paid: ₹{student.payment_status.total_paid.toLocaleString("en-IN")}</span>
                          <span className="text-red-600">Pending: ₹{student.payment_status.total_pending.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    )}
                  </CardHeader>

                  <Collapsible open={isExpanded} onOpenChange={() => toggleCard(student.student_id)}>
                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-6">
                        {/* Standard Fees */}
                        {student.standard_fees.amount > 0 && (
                          <div className="p-4 border rounded-lg bg-indigo-50 dark:bg-indigo-950/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Building2 className="h-5 w-5 text-indigo-600" />
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Standard Fees</h4>
                            </div>
                            <p className="text-2xl font-bold text-indigo-600">
                              ₹{student.standard_fees.amount.toLocaleString("en-IN")}
                            </p>
                          </div>
                        )}

                        {/* Student Services */}
                        {student.student_services.count > 0 && student.student_services.services.some(s => s.id) && (
                          <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950/20">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-purple-600" />
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Additional Services</h4>
                              </div>
                              <span className="text-sm text-muted-foreground">{student.student_services.count} service(s)</span>
                            </div>
                            <div className="space-y-2">
                              {student.student_services.services.filter(s => s.id).map((service) => (
                                <div key={service.id} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded">
                                  <div>
                                    <p className="font-medium">{service.service_name}</p>
                                    {service.notes && (
                                      <p className="text-xs text-muted-foreground">{service.notes}</p>
                                    )}
                                  </div>
                                  <p className="font-semibold">₹{service.amount?.toLocaleString("en-IN")}</p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold">Total Services</span>
                                <span className="text-xl font-bold text-purple-600">
                                  ₹{student.student_services.total.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Fees */}
                        {student.existing_fees.length > 0 && (
                          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
                            <div className="flex items-center gap-2 mb-4">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Existing Fees</h4>
                              <Badge variant="outline" className="ml-auto">{student.existing_fees.length} fee(s)</Badge>
                            </div>
                            <div className="space-y-3">
                              {student.existing_fees.map((fee) => (
                                <div key={fee.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-semibold">{fee.fee_type}</h5>
                                        {getFeeStatusBadge(fee.status)}
                                        <Badge variant="outline">{fee.term}</Badge>
                                      </div>
                                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>Due: {formatDate(fee.due_date)}</span>
                                      </div>
                                    </div>
              </div>
                                  <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Total Amount</p>
                                      <p className="font-semibold">₹{fee.amount.toLocaleString("en-IN")}</p>
              </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Paid</p>
                                      <p className="font-semibold text-green-600">₹{fee.paid.toLocaleString("en-IN")}</p>
              </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Pending</p>
                                      <p className="font-semibold text-red-600">₹{fee.pending.toLocaleString("en-IN")}</p>
              </div>
              </div>
                                  {fee.paid > 0 && fee.pending > 0 && (
                                    <div className="mt-3">
                                      <Progress 
                                        value={(fee.paid / fee.amount) * 100} 
                                        className="h-2"
                                      />
              </div>
                                  )}
              </div>
                              ))}
              </div>
            </div>
                        )}

                        {/* No Fees Message */}
                        {student.payment_status.total_fees === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No fees assigned to this student</p>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No students found</p>
                <p className="text-sm text-muted-foreground">No students match the selected filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
