"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Search, Plus, MoreHorizontal, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

interface StaffMember {
  id: number
  firstName: string
  lastName: string
  email: string
  phone?: string
  role?: {
    id: number
    name: string
  }
  department?: string
  joinDate?: string
  status?: string
}

export default function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([])
  const [departments, setDepartments] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("all")

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    roleId: "",
    department: "",
    password: "",
  })

  // Stats
  const [stats, setStats] = useState({
    totalStaff: 0,
    teachers: 0,
    departments: 0,
    newThisMonth: 0,
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  useEffect(() => {
    calculateStats()
  }, [staffMembers])

  const fetchStaff = async () => {
    setLoading(true)
    try {
      // Get all users, then filter for staff roles
      const res = await api.getUsers()

      if (res.status === 1 || Array.isArray(res) || res.data || res.result) {
        let allUsers = res.data || res.result || res || []
        
        // Filter out students and parents, keep only staff roles
        const staffRoles = ["Principal", "IT Admin", "Accountant", "Teacher", "Support Staff", "Librarian", "Nurse/Medical", "Security"]
        const staff = allUsers
          .filter((user: any) => {
            const roleName = user.role?.name || user.roleName || user.role
            return staffRoles.includes(roleName)
          })
          .map((user: any) => {
            // Map different possible field names to our expected format
            return {
              id: user.id,
              firstName: user.firstName || user.first_name || (user.name ? user.name.split(" ")[0] : "") || "",
              lastName: user.lastName || user.last_name || (user.name ? user.name.split(" ").slice(1).join(" ") : "") || "",
              email: user.email || "",
              phone: user.phone || user.phoneNumber || "",
              role: {
                id: user.role?.id || user.roleId,
                name: user.role?.name || user.roleName || user.role || "",
              },
              department: user.department || "",
              joinDate: user.joinDate || user.join_date || user.createdAt || "",
              status: user.status || "active",
            }
          })

        setStaffMembers(staff)

        // Extract unique departments
        const uniqueDepartments = [...new Set(staff.map((s: any) => s.department).filter(Boolean))]
        setDepartments(uniqueDepartments)
      } else {
        toast.error(res.message || "Failed to load staff")
      }
    } catch (error: any) {
      console.error("Error fetching staff:", error)
      toast.error("Failed to load staff members")
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    setStats({
      totalStaff: staffMembers.length,
      teachers: staffMembers.filter((s) => s.role?.name?.toLowerCase() === "teacher").length,
      departments: departments.length,
      newThisMonth: staffMembers.filter((s) => {
        if (!s.joinDate) return false
        const joinDate = new Date(s.joinDate)
        return joinDate >= startOfMonth
      }).length,
    })
  }

  const handleCreateStaff = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.roleId) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const staffData: any = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roleId: parseInt(formData.roleId),
        phone: formData.phone || undefined,
        department: formData.department || undefined,
      }

      if (formData.password) {
        staffData.password = formData.password
      }

      const res = await api.createUser(staffData)
      if (res.status === 1) {
        toast.success("Staff member added successfully")
        setIsCreateDialogOpen(false)
        resetForm()
        fetchStaff()
      } else {
        toast.error(res.message || "Failed to add staff member")
      }
    } catch (error: any) {
      console.error("Error creating staff:", error)
      toast.error(error.message || "Failed to add staff member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateStaff = async () => {
    if (!selectedStaff) return

    setIsSubmitting(true)
    try {
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
      }

      const res = await api.updateUser(selectedStaff.id.toString(), updateData)
      if (res.status === 1) {
        toast.success("Staff member updated successfully")
        setIsEditDialogOpen(false)
        resetForm()
        fetchStaff()
      } else {
        toast.error(res.message || "Failed to update staff member")
      }
    } catch (error: any) {
      console.error("Error updating staff:", error)
      toast.error(error.message || "Failed to update staff member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return

    setIsSubmitting(true)
    try {
      const res = await api.deleteUser(selectedStaff.id.toString())
      if (res.status === 1) {
        toast.success("Staff member removed successfully")
        setIsDeleteDialogOpen(false)
        setSelectedStaff(null)
        fetchStaff()
      } else {
        toast.error(res.message || "Failed to remove staff member")
      }
    } catch (error: any) {
      console.error("Error deleting staff:", error)
      toast.error(error.message || "Failed to remove staff member")
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditDialog = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone || "",
      roleId: staff.role?.id?.toString() || "",
      department: staff.department || "",
      password: "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (staff: StaffMember) => {
    setSelectedStaff(staff)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      roleId: "",
      department: "",
      password: "",
    })
    setSelectedStaff(null)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "S"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return "N/A"
    }
  }

  const filteredStaff = staffMembers.filter((staff) => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase()
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.department?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === "all" || staff.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const staffRoles = [
    { id: 1, name: "Principal" },
    { id: 2, name: "IT Admin" },
    { id: 3, name: "Accountant" },
    { id: 4, name: "Teacher" },
    { id: 7, name: "Support Staff" },
    { id: 8, name: "Librarian" },
    { id: 9, name: "Nurse/Medical" },
    { id: 10, name: "Security" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-muted-foreground">Manage your school staff members and their information</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Enter the details of the new staff member here.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="create-firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="create-firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="create-lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="create-lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="staff@school.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-phone">Phone</Label>
                <Input
                  id="create-phone"
                  placeholder="+91 90000 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.roleId} onValueChange={(value) => setFormData({ ...formData, roleId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-department">Department</Label>
                <Input
                  id="create-department"
                  placeholder="Mathematics"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="create-password">Password</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Leave empty for auto-generated"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateStaff} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Staff Member"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
            <p className="text-xs text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newThisMonth}</div>
            <p className="text-xs text-muted-foreground">Recent hires</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Staff Directory</CardTitle>
          <CardDescription>Search and filter staff members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredStaff.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStaff.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>{getInitials(staff.firstName, staff.lastName)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {staff.firstName} {staff.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">{staff.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{staff.role?.name || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>{staff.department || "N/A"}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{staff.email}</span>
                          </div>
                          {staff.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <span>{staff.phone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(staff.joinDate)}</TableCell>
                      <TableCell>
                        <Badge variant={staff.status === "active" ? "default" : "secondary"}>
                          {staff.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => openEditDialog(staff)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDeleteDialog(staff)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Remove Staff
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No staff members found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>Update staff member information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-firstName">First Name</Label>
                <Input
                  id="edit-firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-lastName">Last Name</Label>
                <Input
                  id="edit-lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" value={formData.email} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStaff} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Staff"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove{" "}
              <strong>
                {selectedStaff?.firstName} {selectedStaff?.lastName}
              </strong>{" "}
              from the staff directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStaff} disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Staff"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
