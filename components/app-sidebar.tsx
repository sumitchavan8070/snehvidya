"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
  FaUsers,
  FaCalendarAlt,
  FaBookOpen,
  FaCog,
  FaSignOutAlt,
  FaGraduationCap,
  FaDollarSign,
  FaFileAlt,
  FaTh,
  FaPersonBooth,
  FaChevronDown,
  FaChevronRight,
  FaUser,
  FaUserTie,
  FaPencilAlt,
  FaClipboardList,
  FaClipboardCheck,
  FaUserPlus,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaTasks,
  FaMoneyBillWave,
  FaReceipt,
  FaRegListAlt,
  FaCalendarTimes,
} from "react-icons/fa"
import { ReactNode } from "react"
import Image from "next/image"

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
  const userRole = user?.role?.name?.toLowerCase() || "guest"

  const handleLogout = () => {
    api.clearToken()
    router.push("/login")
  }

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )
  }

  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { title: "Dashboard", url: `/dashboard/${userRole}`, icon: <FaTh className="h-4 w-4" /> },
    ]

    switch (userRole) {
      case "admin":
      case "principal":
        return [
          ...commonItems,
          {
            title: "Students",
            icon: <FaGraduationCap className="h-4 w-4" />,
            children: [
              {
                title: "Student List", url: "/dashboard/admin/students",
                icon: <FaRegListAlt className="h-4 w-4" />
              },
              {
                title: "Add Student", url: "/dashboard/admin/students/add",
                icon: <FaUserPlus className="h-4 w-4" />
              },
            ],
          },
          {
            title: "Staff",
            icon: <FaUserTie className="h-4 w-4" />,
            children: [
              {
                title: "Staff List", url: "/dashboard/admin/staff",
                icon: <FaUsers className="h-4 w-4" />
              },
              {
                title: "Add Staff", url: "/dashboard/admin/staff/add",
                icon: <FaUserPlus className="h-4 w-4" />
              },
            ],
          },
          { title: "Attendance", url: "/dashboard/principal/attendance", icon: <FaClipboardCheck className="h-4 w-4" /> },
          { title: "Registration", url: "/dashboard/registration", icon: <FaClipboardCheck className="h-4 w-4" /> },
          { title: "Fees", url: "/dashboard/admin/fees", icon: <FaDollarSign className="h-4 w-4" /> },
          { title: "Reports", url: "/dashboard/admin/reports", icon: <FaFileAlt className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <FaUser className="h-4 w-4" /> },
          { title: "Settings", url: "/dashboard/admin/settings", icon: <FaCog className="h-4 w-4" /> },
        ]

      case "teacher":
        return [
          ...commonItems,
          { title: "My Classes", url: "/dashboard/teacher/classes", icon: <FaChalkboardTeacher className="h-4 w-4" /> },
          { title: "Attendance", url: "/dashboard/attendance", icon: <FaClipboardList className="h-4 w-4" /> },
          { title: "Timetable", url: "/dashboard/timetable", icon: <FaCalendarAlt className="h-4 w-4" /> },
          { title: "Exam", url: "/dashboard/exam", icon: <FaFileAlt className="h-4 w-4" /> },
          { title: "Assignments", url: "/dashboard/teacher/assignments", icon: <FaTasks className="h-4 w-4" /> },
          { title: "Leaves", url: "/dashboard/teacher/leave", icon: <FaCalendarTimes className="h-4 w-4" /> },
          {
            title: "My Class Students",
            icon: <FaUserGraduate className="h-4 w-4" />,
            children: [
              {
                title: "Sudents Fee Details", url: "/dashboard/teacher/students/fees",
                icon: <FaMoneyBillWave className="h-4 w-4" />
              },
              {
                title: "Manage Student Attendance", url: "/dashboard/teacher/students",
                icon: <FaClipboardCheck className="h-4 w-4" />
              },
              {
                title: "Fees Structure", url: "/dashboard/teacher/students/fees-structure",
                icon: <FaReceipt className="h-4 w-4" />
              },

            ],
          },
          { title: "Profile", url: "/dashboard/profile", icon: <FaUser className="h-4 w-4" /> },
        ]

      case "student":
        return [
          ...commonItems,
          { title: "My Subjects", url: "/dashboard/student/subjects", icon: <FaBookOpen className="h-4 w-4" /> },
          { title: "Attendance", url: "/dashboard/attendance", icon: <FaClipboardCheck className="h-4 w-4" /> },
          { title: "Assignments", url: "/dashboard/student/assignments", icon: <FaTasks className="h-4 w-4" /> },
          { title: "Fees", url: "/dashboard/student/fees", icon: <FaDollarSign className="h-4 w-4" /> },
          { title: "Profile", url: "/dashboard/profile", icon: <FaUser className="h-4 w-4" /> },
        ]

      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar className="bg-card shadow-lg">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Image
            src="/snehvidya_logo.png"
            alt="School Logo"
            width={40}
            height={40}
            className="rounded-full"
          />

          <span className="font-bold text-lg text-primary">School MS</span>
        </div>
        <div className="mt-4 p-2 rounded-md bg-secondary text-secondary-foreground">
          <p className="font-semibold">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm capitalize text-muted-foreground">{userRole}</p>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold text-muted-foreground px-4 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title} className="px-2">
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors duration-200"
                      >
                        <span className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.title}</span>
                        </span>
                        {openMenus.includes(item.title) ? <FaChevronDown className="h-3 w-3" /> : <FaChevronRight className="h-3 w-3" />}
                      </button>
                      {openMenus.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1 border-l border-border pl-2">
                          {item.children.map((sub) => (
                            <a
                              key={sub.title}
                              href={sub.url}
                              className="block px-3 py-2 text-sm rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors duration-200"
                            >
                              {sub.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild className="p-0">
                      <a href={item.url || "#"} className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors duration-200">
                        {item.icon}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <Button variant="outline" onClick={handleLogout} className="w-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors duration-200">
          <FaSignOutAlt className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}