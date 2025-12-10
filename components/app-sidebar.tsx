"use client"

import { useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"

import {
  LayoutDashboard,
  Lock,
  GraduationCap,
  List,
  UserPlus,
  Briefcase,
  Users,
  ClipboardCheck,
  DollarSign,
  FileText,
  User,
  Settings,
  Calendar,
  UserCircle,
  School,
  ClipboardList,
  CheckSquare,
  CalendarX,
  Wallet,
  Receipt,
  BookOpen,
  LogOut,
  ChevronDown,
  ChevronRight,
  Coins,
  Monitor,
  Calculator,
  HeartHandshake,
  Shield,
  Library,
  Stethoscope,
  HelpCircle,
  CheckCircle,
} from "lucide-react"

interface AppSidebarProps {
  user: any
}

interface MenuItem {
  title: string
  url?: string
  icon: ReactNode
  children?: MenuItem[]
}

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter()
  const [openMenus, setOpenMenus] = useState<string[]>([])
  
  // Normalize role name - handle spaces, special characters, and case
  const normalizeRole = (roleName: string): string => {
    if (!roleName) return "guest"
    return roleName
      .toLowerCase()
      .replace(/\s+/g, "-")  // Replace spaces with hyphens
      .replace(/\//g, "-")  // Replace slashes with hyphens
      .replace(/[^a-z0-9-]/g, "")  // Remove special characters
  }
  
  const userRole = normalizeRole(user?.role?.name || "guest")

  const handleLogout = () => {
    api.clearToken()
    router.push("/login")
  }

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    )
  }

  // MENU ITEMS FOR ALL ROLES
  const getMenuItems = (): MenuItem[] => {
    const commonItems = [
      {
        title: "Dashboard",
        url: `/dashboard/${userRole}`,
        icon: <LayoutDashboard className="h-4 w-4" />,
      },
 {
  title: "Change Password",
  url: `/dashboard/change-password`,
  icon: <Lock className="h-4 w-4" />,
}
    ]

    switch (userRole) {
      case "admin":
        return [
          ...commonItems,

          {
            title: "Students",
            icon: <GraduationCap className="h-4 w-4" />,
            children: [
              { title: "Student List", url: "/dashboard/admin/students", icon: <List className="h-4 w-4" /> },
              { title: "Add Student", url: "/dashboard/admin/students/add", icon: <UserPlus className="h-4 w-4" /> },
            ],
          },

          {
            title: "Staff",
            icon: <Briefcase className="h-4 w-4" />,
            children: [
              { title: "Staff List", url: "/dashboard/admin/staff", icon: <Users className="h-4 w-4" /> },
              { title: "Add Staff", url: "/dashboard/admin/staff/add", icon: <UserPlus className="h-4 w-4" /> },
            ],
          },

          { title: "Attendance", url: "/dashboard/principal/attendance", icon: <ClipboardCheck className="h-4 w-4" /> },
          { title: "Registration", url: "/dashboard/registration", icon: <ClipboardCheck className="h-4 w-4" /> },
          { title: "Fees", url: "/dashboard/admin/fees", icon: <DollarSign className="h-4 w-4" /> },
          { title: "Reports", url: "/dashboard/admin/reports", icon: <FileText className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
          { title: "Settings", url: "/dashboard/admin/settings", icon: <Settings className="h-4 w-4" /> },
        ]

      case "principal":
        return [
          ...commonItems,

          { title: "Attendance", url: "/dashboard/principal/attendance", icon: <Calendar className="h-4 w-4" /> },
          { title: "Staff Directory", url: "/dashboard/principal/staff", icon: <Users className="h-4 w-4" /> },
          { title: "Fees Structure", url: "/dashboard/principal/fees-structure", icon: <DollarSign className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <UserCircle className="h-4 w-4" /> },
          { title: "Settings", url: "/dashboard/principal/settings", icon: <Settings className="h-4 w-4" /> },
        ]

      case "teacher":
        return [
          ...commonItems,

          // { title: "My Classes", url: "/dashboard/teacher/classes", icon: <School className="h-4 w-4" /> },
          { title: "Attendance", url: "/dashboard/attendance", icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Timetable", url: "/dashboard/timetable", icon: <Calendar className="h-4 w-4" /> },
          { title: "Exam", url: "/dashboard/exam", icon: <FileText className="h-4 w-4" /> },
          { title: "Assignments", url: "/dashboard/teacher/assignments", icon: <CheckSquare className="h-4 w-4" /> },
          { title: "Leaves", url: "/dashboard/teacher/leave", icon: <CalendarX className="h-4 w-4" /> },

          {
            title: "My Class Students",
            icon: <GraduationCap className="h-4 w-4" />,
            children: [
              { title: "Students Fee Details", url: "/dashboard/teacher/students/fees", icon: <Wallet className="h-4 w-4" /> },
              { title: "Manage Student Attendance", url: "/dashboard/teacher/students", icon: <ClipboardCheck className="h-4 w-4" /> },
              { title: "Fees Structure", url: "/dashboard/teacher/students/fees-structure", icon: <Receipt className="h-4 w-4" /> },
            ],
          },

          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
          { title: "Support", url: "/dashboard/teacher/support", icon: <CalendarX className="h-4 w-4" /> },

        ]

      case "student":
        return [
          ...commonItems,
          { title: "My Subjects", url: "/dashboard/student/subjects", icon: <BookOpen className="h-4 w-4" /> },
          { title: "Exams", url: "/dashboard/student/exams", icon: <FileText className="h-4 w-4" /> },
          { title: "Attendance", url: "/dashboard/attendance", icon: <ClipboardCheck className="h-4 w-4" /> },
          { title: "Assignments", url: "/dashboard/student/assignments", icon: <CheckSquare className="h-4 w-4" /> },
          { title: "Fees", url: "/dashboard/student/fees", icon: <Coins className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "it-admin":
      case "itadmin":
        return [
          ...commonItems,
          { title: "User Management", url: "/dashboard/it-admin/users", icon: <Users className="h-4 w-4" /> },
          { title: "System Settings", url: "/dashboard/it-admin/settings", icon: <Settings className="h-4 w-4" /> },
          { title: "System Logs", url: "/dashboard/it-admin/logs", icon: <FileText className="h-4 w-4" /> },
          { title: "Backup & Restore", url: "/dashboard/it-admin/backup", icon: <Monitor className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "accountant":
        return [
          ...commonItems,
          { title: "Fees Management", url: "/dashboard/accountant/fees", icon: <DollarSign className="h-4 w-4" /> },
          { title: "Payments", url: "/dashboard/accountant/payments", icon: <Receipt className="h-4 w-4" /> },
          { title: "Financial Reports", url: "/dashboard/accountant/reports", icon: <FileText className="h-4 w-4" /> },
          { title: "Transactions", url: "/dashboard/accountant/transactions", icon: <Calculator className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "parent":
        return [
          ...commonItems,
          { title: "My Children", url: "/dashboard/parent/children", icon: <GraduationCap className="h-4 w-4" /> },
          { title: "Attendance", url: "/dashboard/parent/attendance", icon: <ClipboardCheck className="h-4 w-4" /> },
          { title: "Grades & Exams", url: "/dashboard/parent/grades", icon: <FileText className="h-4 w-4" /> },
          { title: "Fees & Payments", url: "/dashboard/parent/fees", icon: <Wallet className="h-4 w-4" /> },
          { title: "Communications", url: "/dashboard/parent/messages", icon: <HelpCircle className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "support-staff":
      case "supportstaff":
        return [
          ...commonItems,
          { title: "Maintenance Requests", url: "/dashboard/support-staff/maintenance", icon: <Briefcase className="h-4 w-4" /> },
          { title: "Facilities", url: "/dashboard/support-staff/facilities", icon: <School className="h-4 w-4" /> },
          { title: "Tasks", url: "/dashboard/support-staff/tasks", icon: <CheckSquare className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "librarian":
        return [
          ...commonItems,
          { title: "Books Catalog", url: "/dashboard/librarian/books", icon: <BookOpen className="h-4 w-4" /> },
          { title: "Issued Books", url: "/dashboard/librarian/issued", icon: <List className="h-4 w-4" /> },
          { title: "Return Books", url: "/dashboard/librarian/returns", icon: <CheckCircle className="h-4 w-4" /> },
          { title: "Library Reports", url: "/dashboard/librarian/reports", icon: <FileText className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "nurse":
      case "nurse-medical":
      case "medical":
        return [
          ...commonItems,
          { title: "Student Health Records", url: "/dashboard/nurse/health-records", icon: <Stethoscope className="h-4 w-4" /> },
          { title: "Medical Appointments", url: "/dashboard/nurse/appointments", icon: <Calendar className="h-4 w-4" /> },
          { title: "Medications", url: "/dashboard/nurse/medications", icon: <HeartHandshake className="h-4 w-4" /> },
          { title: "Health Reports", url: "/dashboard/nurse/reports", icon: <FileText className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      case "security":
        return [
          ...commonItems,
          { title: "Visitor Management", url: "/dashboard/security/visitors", icon: <Users className="h-4 w-4" /> },
          { title: "Entry/Exit Logs", url: "/dashboard/security/logs", icon: <ClipboardList className="h-4 w-4" /> },
          { title: "Incident Reports", url: "/dashboard/security/incidents", icon: <FileText className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <User className="h-4 w-4" /> },
        ]

      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar className="bg-card shadow-lg">

      {/* HEADER */}
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Image src="/snehvidya_logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
          <span className="font-bold text-lg text-primary">School MS</span>
        </div>

        <div className="mt-4 p-2 rounded-md bg-secondary text-secondary-foreground">
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm capitalize text-muted-foreground">{userRole}</p>
        </div>
      </SidebarHeader>

      {/* MENU CONTENT */}
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-4 mb-2">
            Navigation
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="px-2">

                  {/* ITEMS WITH CHILDREN */}
                  {item.children ? (
                    <>
                      <SidebarMenuButton
                        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent"
                        onClick={() => toggleMenu(item.title)}
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          {item.title}
                        </span>

                        {openMenus.includes(item.title) ?
                          <ChevronDown className="h-3 w-3" /> :
                          <ChevronRight className="h-3 w-3" />}
                      </SidebarMenuButton>

                      {openMenus.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-border pl-3">
                          {item.children.map((sub) => (
                            <SidebarMenuButton
                              key={sub.title}
                              asChild
                              className="flex items-center gap-3 text-sm px-3 py-2 rounded-md text-muted-foreground hover:bg-accent hover:text-primary"
                            >
                              <Link href={sub.url!}>
                                <span className="flex items-center gap-3">
                                  {sub.icon}
                                  {sub.title}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    /* SIMPLE MENU ITEM */
                    <SidebarMenuButton asChild>
                      <Link href={item.url!} className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-accent">
                        {item.icon}
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  )}

                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="p-4 border-t border-border">
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
