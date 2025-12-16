"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { School, Plus, UserPlus, Search, Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface Class {
  id: number
  className: string
  grade: string
  section?: string
  capacity?: number
  currentStudents?: number
  academicYear?: string
  teacherId?: number
  teacherName?: string
  teacherEmail?: string
  status?: string
}

interface Teacher {
  id: number
  firstName: string
  lastName: string
  email: string
  hasClass: boolean
  currentClassId?: number
  currentClassName?: string
}

export default function ClassesManagement() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loadingClasses, setLoadingClasses] = useState(true)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loadingTeachers, setLoadingTeachers] = useState(false)
  const [isCreateClassDialogOpen, setIsCreateClassDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedClassForAssign, setSelectedClassForAssign] = useState<Class | null>(null)
  const [classSearchTerm, setClassSearchTerm] = useState("")
  const [isSubmittingClass, setIsSubmittingClass] = useState(false)
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false)

  const [classFormData, setClassFormData] = useState({
    className: "",
    grade: "",
    section: "",
    capacity: "",
    academicYear: new Date().getFullYear().toString(),
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (isAssignDialogOpen && selectedClassForAssign) {
      fetchTeachers()
    }
  }, [isAssignDialogOpen, selectedClassForAssign])

  const fetchClasses = async () => {
    setLoadingClasses(true)
    try {
      const res = await api.getPrincipalClasses()
      if (res.status === 1 || Array.isArray(res) || res.data) {
        const classesData = res.data || res || []
        setClasses(classesData)
      }
    } catch (error: any) {
      console.error("Error fetching classes:", error)
      toast.error("Failed to load classes")
    } finally {
      setLoadingClasses(false)
    }
  }

  const fetchTeachers = async () => {
    setLoadingTeachers(true)
    try {
      const res = await api.getPrincipalTeachers()
      if (res.status === 1 || Array.isArray(res) || res.data) {
        const teachersData = res.data || res || []
        setTeachers(teachersData)
      }
    } catch (error: any) {
      console.error("Error fetching teachers:", error)
      toast.error("Failed to load teachers")
    } finally {
      setLoadingTeachers(false)
    }
  }

  const handleCreateClass = async () => {
    if (!classFormData.className || !classFormData.grade) {
      toast.error("Please fill in class name and grade")
      return
    }

    // Check for duplicate class
    const duplicateClass = classes.find(
      (c) =>
        c.className.toLowerCase() === classFormData.className.toLowerCase() &&
        c.grade.toLowerCase() === classFormData.grade.toLowerCase() &&
        (!classFormData.section || c.section?.toLowerCase() === classFormData.section.toLowerCase())
    )

    if (duplicateClass) {
      toast.error("A class with this name, grade, and section already exists")
      return
    }

    setIsSubmittingClass(true)
    try {
      const res = await api.createPrincipalClass({
        className: classFormData.className,
        grade: classFormData.grade,
        section: classFormData.section || undefined,
        capacity: classFormData.capacity ? parseInt(classFormData.capacity) : undefined,
        academicYear: classFormData.academicYear || undefined,
      })

      if (res.status === 1) {
        toast.success("Class created successfully")
        setIsCreateClassDialogOpen(false)
        setClassFormData({
          className: "",
          grade: "",
          section: "",
          capacity: "",
          academicYear: new Date().getFullYear().toString(),
        })
        fetchClasses()
      } else {
        toast.error(res.message || "Failed to create class")
      }
    } catch (error: any) {
      console.error("Error creating class:", error)
      toast.error(error.message || "Failed to create class")
    } finally {
      setIsSubmittingClass(false)
    }
  }

  const handleAssignTeacher = async (teacherId: number) => {
    if (!selectedClassForAssign) return

    // Check if teacher already has a class
    const teacher = teachers.find((t) => t.id === teacherId)
    if (teacher?.hasClass) {
      toast.error(`This teacher is already assigned to ${teacher.currentClassName}`)
      return
    }

    setIsSubmittingAssign(true)
    try {
      const res = await api.assignTeacherToClass(selectedClassForAssign.id, teacherId)
      if (res.status === 1) {
        toast.success("Teacher assigned to class successfully")
        setIsAssignDialogOpen(false)
        setSelectedClassForAssign(null)
        fetchClasses()
      } else {
        toast.error(res.message || "Failed to assign teacher")
      }
    } catch (error: any) {
      console.error("Error assigning teacher:", error)
      toast.error(error.message || "Failed to assign teacher")
    } finally {
      setIsSubmittingAssign(false)
    }
  }

  const handleUnassignTeacher = async (classId: number) => {
    try {
      const res = await api.unassignTeacherFromClass(classId)
      if (res.status === 1) {
        toast.success("Teacher unassigned successfully")
        fetchClasses()
      } else {
        toast.error(res.message || "Failed to unassign teacher")
      }
    } catch (error: any) {
      console.error("Error unassigning teacher:", error)
      toast.error(error.message || "Failed to unassign teacher")
    }
  }

  const openAssignDialog = (classItem: Class) => {
    setSelectedClassForAssign(classItem)
    setIsAssignDialogOpen(true)
  }

  const filteredClasses = classes.filter((classItem) => {
    const searchLower = classSearchTerm.toLowerCase()
    return (
      classItem.className?.toLowerCase().includes(searchLower) ||
      classItem.grade?.toLowerCase().includes(searchLower) ||
      classItem.section?.toLowerCase().includes(searchLower) ||
      classItem.teacherName?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes Management</h1>
          <p className="text-muted-foreground">Create and manage classes, assign teachers to classes</p>
        </div>
        <Button onClick={() => setIsCreateClassDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Class
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Classes</CardTitle>
          <CardDescription>View and manage all school classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={classSearchTerm}
                onChange={(e) => setClassSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {loadingClasses ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <p className="text-muted-foreground">Loading classes...</p>
            </div>
          ) : filteredClasses.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Assigned Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((classItem) => (
                    <TableRow key={classItem.id}>
                      <TableCell className="font-medium">{classItem.className}</TableCell>
                      <TableCell>{classItem.grade}</TableCell>
                      <TableCell>{classItem.section || "N/A"}</TableCell>
                      <TableCell>
                        {classItem.currentStudents || 0}
                        {classItem.capacity && ` / ${classItem.capacity}`}
                      </TableCell>
                      <TableCell>
                        {classItem.teacherName ? (
                          <div>
                            <div className="font-medium">{classItem.teacherName}</div>
                            <div className="text-xs text-muted-foreground">{classItem.teacherEmail}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={classItem.status === "active" ? "default" : "secondary"}>
                          {classItem.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {classItem.teacherId ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnassignTeacher(classItem.id)}
                            >
                              Unassign
                            </Button>
                          ) : (
                            <Button size="sm" onClick={() => openAssignDialog(classItem)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Teacher
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <School className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No classes found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Class Dialog */}
      <Dialog open={isCreateClassDialogOpen} onOpenChange={setIsCreateClassDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
            <DialogDescription>Add a new class to the school system</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="className">
                Class Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="className"
                placeholder="e.g., Grade 10A"
                value={classFormData.className}
                onChange={(e) => setClassFormData({ ...classFormData, className: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="grade">
                Grade <span className="text-red-500">*</span>
              </Label>
              <Input
                id="grade"
                placeholder="e.g., 10"
                value={classFormData.grade}
                onChange={(e) => setClassFormData({ ...classFormData, grade: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                placeholder="e.g., A, B, C"
                value={classFormData.section}
                onChange={(e) => setClassFormData({ ...classFormData, section: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 40"
                value={classFormData.capacity}
                onChange={(e) => setClassFormData({ ...classFormData, capacity: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g., 2024-2025"
                value={classFormData.academicYear}
                onChange={(e) => setClassFormData({ ...classFormData, academicYear: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateClassDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateClass} disabled={isSubmittingClass}>
              {isSubmittingClass ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Class"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Teacher Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Teacher to Class</DialogTitle>
            <DialogDescription>
              Select a teacher to assign to {selectedClassForAssign?.className}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loadingTeachers ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <p className="text-muted-foreground">Loading teachers...</p>
              </div>
            ) : teachers.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      teacher.hasClass
                        ? "bg-muted cursor-not-allowed opacity-60"
                        : "hover:bg-accent cursor-pointer"
                    }`}
                    onClick={() => !teacher.hasClass && handleAssignTeacher(teacher.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                        {teacher.hasClass && (
                          <div className="text-xs text-yellow-600 mt-1">
                            Already assigned to {teacher.currentClassName}
                          </div>
                        )}
                      </div>
                      {teacher.hasClass && (
                        <Badge variant="secondary">Assigned</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No teachers available</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}






