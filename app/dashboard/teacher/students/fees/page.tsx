"use client"

import { SetStateAction, useEffect, useState } from "react"
import { format } from "date-fns"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { Table, TableHeader, TableRow, TableCell, TableBody, TableHead } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, Download, Users, TrendingUp, CircleCheck, CircleX, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Fee {
  id: number
  amount: number
  due_date: string
  fee_type: string
  status: "paid" | "unpaid" | "overdue"
  term: string
  student_name: string
  roll_number: number
  class_name: string
}

export default function FeesManagement() {
  const [fees, setFees] = useState<Fee[]>([])
  const [filteredFees, setFilteredFees] = useState<Fee[]>([])
  const [loading, setLoading] = useState(false)

  // Filters
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  // Add/Edit Dialog
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<Fee | null>(null)
  const [formData, setFormData] = useState<Partial<Fee>>({})

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    overdue: 0,
  })

  useEffect(() => {
    fetchFees()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [fees, search, statusFilter, classFilter])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesList()
      if (res.status === 1 && res.result) {
        setFees(res.result)
        calculateStats(res.result)
      } else {
        toast.error("Failed to fetch fees data.")
        setFees([])
      }
    } catch (error) {
      console.error(error)
      toast.error("Error fetching data.")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (data: Fee[]) => {
    const total = data.length
    const paid = data.filter(f => f.status.toLowerCase() === "paid").length
    const unpaid = data.filter(f => f.status.toLowerCase() === "unpaid").length
    const overdue = data.filter(f => f.status.toLowerCase() === "overdue").length
    setStats({ total, paid, unpaid, overdue })
  }

  const applyFilters = () => {
    let filtered = [...fees]

    if (search) {
      filtered = filtered.filter(f =>
        f.student_name.toLowerCase().includes(search.toLowerCase()) ||
        f.class_name.toLowerCase().includes(search.toLowerCase()) ||
        f.fee_type.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(f => f.status.toLowerCase() === statusFilter)
    }

    if (classFilter !== "all") {
      filtered = filtered.filter(f => f.class_name.toLowerCase() === classFilter)
    }

    setFilteredFees(filtered)
  }

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee)
    setFormData(fee)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingFee(null)
    setFormData({})
    setDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      if (editingFee) {
        // Mock update API call
        // await api.updateFee(editingFee.id, formData)
        toast.success("Fee updated successfully")
      } else {
        // Mock add API call
        // await api.addFee(formData)
        toast.success("Fee added successfully")
      }
      setDialogOpen(false)
      fetchFees()
    } catch (error) {
      toast.error("Error saving fee data")
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Records</CardTitle>
              <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Paid</CardTitle>
              <CircleCheck className="h-5 w-5 text-green-600 dark:text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.paid}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? `${Math.round((stats.paid / stats.total) * 100)}% of total` : "0%"}</p>
              <Progress value={stats.total > 0 ? (stats.paid / stats.total) * 100 : 0} className="mt-2 h-2 [&>*]:bg-green-500" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Unpaid</CardTitle>
              <CircleX className="h-5 w-5 text-red-600 dark:text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.unpaid}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? `${Math.round((stats.unpaid / stats.total) * 100)}% of total` : "0%"}</p>
              <Progress value={stats.total > 0 ? (stats.unpaid / stats.total) * 100 : 0} className="mt-2 h-2 [&>*]:bg-red-500" />
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-md transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">Overdue</CardTitle>
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground mt-1">{stats.total > 0 ? `${Math.round((stats.overdue / stats.total) * 100)}% of total` : "0%"}</p>
              <Progress value={stats.total > 0 ? (stats.overdue / stats.total) * 100 : 0} className="mt-2 h-2 [&>*]:bg-yellow-500" />
            </CardContent>
          </Card>
        </div>

        {/* Filters and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search by student, class, or type"
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-gray-100 dark:bg-gray-700">
                <SelectValue placeholder="Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {[...new Set(fees.map(f => f.class_name))].map(cls => (
                  <SelectItem key={cls} value={cls.toLowerCase()}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
            + Add New Fee
          </Button>
        </div>

        {/* Fees Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader className="bg-gray-50 dark:bg-gray-900">
                <TableRow className="border-b border-gray-200 dark:border-gray-700">
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Student</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Roll</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Class</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Type</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Amount</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Due Date</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Status</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Term</TableHead>
                  <TableHead className="py-4 text-gray-500 dark:text-gray-400 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-12">
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading records...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredFees.length > 0 ? (
                  filteredFees.map((fee, index) => (
                    <TableRow
                      key={fee.id}
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900",
                        "hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                    >
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">{fee.student_name}</TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">{fee.roll_number}</TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">{fee.class_name}</TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">{fee.fee_type}</TableCell>
                      <TableCell className="py-3 font-semibold text-gray-900 dark:text-gray-100">₹{fee.amount}</TableCell>
                      <TableCell className="py-3 text-gray-500 dark:text-gray-400">{format(new Date(fee.due_date), "MMM d, yyyy")}</TableCell>
                      <TableCell className="py-3">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-semibold capitalize",
                          fee.status === "paid" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                          fee.status === "unpaid" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
                          fee.status === "overdue" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                        )}>
                          {fee.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3 text-gray-800 dark:text-gray-200">{fee.term}</TableCell>
                      <TableCell className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(fee)}
                          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8">
                      No fee records found for the selected filters.
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
              <DialogTitle>{editingFee ? "Edit Fee" : "Add New Fee"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Student</label>
                <Input placeholder="Student Name" value={formData.student_name || ""} onChange={e => setFormData({ ...formData, student_name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Roll Number</label>
                <Input placeholder="Roll Number" type="number" value={formData.roll_number || ""} onChange={e => setFormData({ ...formData, roll_number: Number(e.target.value) })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Class</label>
                <Input placeholder="Class" value={formData.class_name || ""} onChange={e => setFormData({ ...formData, class_name: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Fee Type</label>
                <Input placeholder="Fee Type" value={formData.fee_type || ""} onChange={e => setFormData({ ...formData, fee_type: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Amount</label>
                <Input placeholder="Amount" type="number" value={formData.amount || ""} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Due Date</label>
                <Input placeholder="Due Date" type="date" value={formData.due_date || ""} onChange={e => setFormData({ ...formData, due_date: e.target.value })} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Status</label>
                <Select value={formData.status || ""} onValueChange={val => setFormData({ ...formData, status: val as "paid" | "unpaid" | "overdue" })}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label className="text-right">Term</label>
                <Input placeholder="Term" value={formData.term || ""} onChange={e => setFormData({ ...formData, term: e.target.value })} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}