"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, PlusCircle, PencilLine, Trash2, Search, Bus, BookOpen, Activity } from "lucide-react"
import { api } from "@/lib/api"

interface StudentService {
  id: number
  student_id: number
  student_name: string
  roll_number: number
  class_name: string
  service_name: string
  amount: number
  is_active: boolean
  start_date: string | null
  end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

interface ServiceFormState {
  id?: number
  student_id: number | null
  service_name: string
  amount: number
  is_active: boolean
  start_date: string
  end_date: string
  notes: string
}

interface Student {
  id: number
  name: string
  roll_number: number
  class_name: string
}

const AVAILABLE_SERVICES = [
  { name: "School Transport", icon: Bus, description: "Bus / cab facility" },
  { name: "Digital Learning Suite", icon: BookOpen, description: "LMS, smart classroom subscription" },
  { name: "Extracurricular Activities", icon: Activity, description: "Clubs, sports, cultural programs" },
  { name: "Hostel & Boarding", icon: BookOpen, description: "Residential facility" },
  { name: "Laboratory Charges", icon: BookOpen, description: "Science and computer lab" },
  { name: "Student Insurance", icon: BookOpen, description: "Annual coverage" },
]

export default function StudentServicesManagement() {
  const [services, setServices] = useState<StudentService[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StudentService | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formState, setFormState] = useState<ServiceFormState | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterClass, setFilterClass] = useState<string>("all")
  const [filterService, setFilterService] = useState<string>("all")

  useEffect(() => {
    fetchServices()
    fetchStudents()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await api.getStudentServices()
      if (res.status === 1 && Array.isArray(res.result)) {
        setServices(res.result)
      } else {
        toast.error("Failed to load student services.")
        setServices([])
      }
    } catch (error) {
      console.error("Error fetching student services:", error)
      toast.error("Unable to fetch student services.")
    } finally {
      setLoading(false)
    }
  }

  const fetchStudents = async () => {
    setLoadingStudents(true)
    try {
      // Fetch students from class - using the same API as attendance
      const today = new Date().toISOString().split("T")[0]
      const res = await api.getClassStudents(today)
      if (res.status === 1 && Array.isArray(res.result)) {
        const studentList: Student[] = res.result.map((item: any) => ({
          id: item.student_id,
          name: item.student_name,
          roll_number: item.roll_number || 0,
          class_name: item.class_name || "Unknown",
        }))
        setStudents(studentList)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    } finally {
      setLoadingStudents(false)
    }
  }

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch =
        searchTerm === "" ||
        service.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.class_name.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesClass = filterClass === "all" || service.class_name === filterClass
      const matchesService = filterService === "all" || service.service_name === filterService

      return matchesSearch && matchesClass && matchesService
    })
  }, [services, searchTerm, filterClass, filterService])

  const totalAmount = useMemo(() => {
    return filteredServices
      .filter((s) => s.is_active)
      .reduce((sum, service) => sum + (service.amount || 0), 0)
  }, [filteredServices])

  const uniqueClasses = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.class_name))).sort()
  }, [services])

  const uniqueServiceNames = useMemo(() => {
    return Array.from(new Set(services.map((s) => s.service_name))).sort()
  }, [services])

  const openDialogForService = (service?: StudentService) => {
    const state: ServiceFormState = {
      id: service?.id,
      student_id: service?.student_id || null,
      service_name: service?.service_name || "",
      amount: service?.amount || 0,
      is_active: service?.is_active ?? true,
      start_date: service?.start_date ? service.start_date.split("T")[0] : "",
      end_date: service?.end_date ? service.end_date.split("T")[0] : "",
      notes: service?.notes || "",
    }
    setFormState(state)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!formState) return
    if (!formState.student_id) {
      toast.error("Please select a student.")
      return
    }
    if (!formState.service_name.trim()) {
      toast.error("Service name is required.")
      return
    }
    if (formState.amount < 0) {
      toast.error("Amount must be a positive number.")
      return
    }

    setIsSaving(true)
    try {
      const serviceData = {
        student_id: formState.student_id,
        service_name: formState.service_name,
        amount: formState.amount,
        is_active: formState.is_active,
        start_date: formState.start_date || null,
        end_date: formState.end_date || null,
        notes: formState.notes || null,
      }

      if (formState.id) {
        // Update existing
        const res = await api.updateStudentService(formState.id, serviceData)
        if (res.status === 1) {
          toast.success("Student service updated successfully")
          setDialogOpen(false)
          fetchServices()
        } else {
          toast.error(res.error || "Failed to update student service")
        }
      } else {
        // Create new
        const res = await api.createStudentService(serviceData)
        if (res.status === 1) {
          toast.success("Student service created successfully")
          setDialogOpen(false)
          fetchServices()
        } else {
          toast.error(res.error || "Failed to create student service")
        }
      }
    } catch (error: any) {
      console.error("Failed to save student service:", error)
      toast.error(error.message || "Unable to save student service.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (service: StudentService) => {
    setDeleteTarget(service)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id) return

    setIsDeleting(true)
    try {
      const res = await api.deleteStudentService(deleteTarget.id)
      if (res.status === 1) {
        toast.success("Student service deleted successfully")
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchServices()
      } else {
        toast.error(res.error || "Failed to delete student service")
      }
    } catch (error: any) {
      console.error("Failed to delete student service:", error)
      toast.error(error.message || "Unable to delete student service.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Manage Student Services</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Manage extra services (transport, hostel, etc.) for individual students at student level.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground">
            <p className="font-bold text-base sm:text-lg text-primary">
              Total Active Services: <span className="font-extrabold">₹{totalAmount.toLocaleString()}</span>
            </p>
            <p className="text-xs sm:text-sm">
              {filteredServices.filter((s) => s.is_active).length} active service(s)
            </p>
          </div>
          <Button onClick={() => openDialogForService()} className="gap-2 w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6 shadow-md">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student or service..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label>Filter by Class</Label>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map((className) => (
                    <SelectItem key={className} value={className}>
                      {className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Filter by Service</Label>
              <Select value={filterService} onValueChange={setFilterService}>
                <SelectTrigger>
                  <SelectValue placeholder="All Services" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  {uniqueServiceNames.map((serviceName) => (
                    <SelectItem key={serviceName} value={serviceName}>
                      {serviceName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Student Services</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table className="w-full">
                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="min-w-[120px]">Student</TableHead>
                    <TableHead className="min-w-[100px]">Roll No.</TableHead>
                    <TableHead className="min-w-[100px]">Class</TableHead>
                    <TableHead className="min-w-[150px]">Service</TableHead>
                    <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Start Date</TableHead>
                    <TableHead className="min-w-[100px]">End Date</TableHead>
                    <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading services...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredServices.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                        No student services found. Use "Add Service" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredServices.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-semibold">{service.student_name}</TableCell>
                        <TableCell>{service.roll_number}</TableCell>
                        <TableCell>{service.class_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{service.service_name}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{service.amount.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.is_active ? "default" : "secondary"}>
                            {service.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {service.start_date ? new Date(service.start_date).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {service.end_date ? new Date(service.end_date).toLocaleDateString() : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-blue-600 h-8 px-2 sm:px-3"
                              onClick={() => openDialogForService(service)}
                            >
                              <PencilLine className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 h-8 px-2 sm:px-3 hover:text-red-700"
                              onClick={() => handleDeleteClick(service)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formState?.id ? "Update Student Service" : "Add Student Service"}</DialogTitle>
          </DialogHeader>
          {formState && (
            <div className="space-y-6">
              <div>
                <Label>Student *</Label>
                <Select
                  value={formState.student_id?.toString() || ""}
                  onValueChange={(value) =>
                    setFormState((prev) => (prev ? { ...prev, student_id: parseInt(value) } : prev))
                  }
                  disabled={!!formState.id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name} ({student.class_name}) - Roll: {student.roll_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Name *</Label>
                <Select
                  value={formState.service_name}
                  onValueChange={(value) =>
                    setFormState((prev) => (prev ? { ...prev, service_name: value } : prev))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_SERVICES.map((service) => (
                      <SelectItem key={service.name} value={service.name}>
                        {service.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Service</SelectItem>
                  </SelectContent>
                </Select>
                {formState.service_name === "custom" && (
                  <Input
                    className="mt-2"
                    placeholder="Enter custom service name"
                    value={formState.service_name === "custom" ? "" : formState.service_name}
                    onChange={(e) =>
                      setFormState((prev) => (prev ? { ...prev, service_name: e.target.value } : prev))
                    }
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Amount (₹) *</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formState.amount}
                    onChange={(e) =>
                      setFormState((prev) => (prev ? { ...prev, amount: Number(e.target.value) || 0 } : prev))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    checked={formState.is_active}
                    onCheckedChange={(checked) =>
                      setFormState((prev) => (prev ? { ...prev, is_active: checked } : prev))
                    }
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={formState.start_date}
                    onChange={(e) =>
                      setFormState((prev) => (prev ? { ...prev, start_date: e.target.value } : prev))
                    }
                  />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={formState.end_date}
                    onChange={(e) =>
                      setFormState((prev) => (prev ? { ...prev, end_date: e.target.value } : prev))
                    }
                  />
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(e) =>
                    setFormState((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                  }
                  placeholder="Optional notes about this service..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formState?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service <strong>{deleteTarget?.service_name}</strong> for{" "}
              <strong>{deleteTarget?.student_name}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

