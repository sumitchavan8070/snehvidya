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
} from "react-icons/fa"
import { ReactNode } from "react"

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
      { title: "Dashboard", url: `/dashboard/${userRole}`, icon: <FaTh /> },
    ]

    switch (userRole) {
      case "admin":
      case "principal":
        return [
          ...commonItems,
          {
            title: "Students",
            icon: <FaGraduationCap />,
            children: [
              {
                title: "Student List", url: "/dashboard/admin/students",
                icon: undefined
              },
              {
                title: "Add Student", url: "/dashboard/admin/students/add",
                icon: undefined
              },
            ],
          },
          {
            title: "Staff",
            icon: <FaUsers />,
            children: [
              {
                title: "Staff List", url: "/dashboard/admin/staff",
                icon: undefined
              },
              {
                title: "Add Staff", url: "/dashboard/admin/staff/add",
                icon: undefined
              },
            ],
          },
          { title: "Attendance", url: "/dashboard/principal/attendance", icon: <FaCalendarAlt /> },
          { title: "Fees", url: "/dashboard/admin/fees", icon: <FaDollarSign /> },
          { title: "Reports", url: "/dashboard/admin/reports", icon: <FaFileAlt /> },
          { title: "Profile", url: "/dashboard/profile", icon: <FaPersonBooth /> },
          { title: "Settings", url: "/dashboard/admin/settings", icon: <FaCog /> },
        ]

      case "teacher":
        return [
          ...commonItems,
          { title: "My Classes", url: "/dashboard/teacher/classes", icon: <FaBookOpen /> },
          { title: "Attendance", url: "/dashboard/teacher/attendance", icon: <FaCalendarAlt /> },
          { title: "Timetable", url: "/dashboard/timetable", icon: <FaCalendarAlt /> },
          { title: "Exam", url: "/dashboard/exam", icon: <FaCalendarAlt /> },

          { title: "Assignments", url: "/dashboard/teacher/assignments", icon: <FaFileAlt /> },
          { title: "Leaves", url: "/dashboard/teacher/leave", icon: <FaFileAlt /> },
           {
            title: "Students",
            icon: <FaGraduationCap />,
            children: [
              {
                title: "Fees details", url: "/dashboard/teacher/students/fees",
                icon: undefined
              },
              {
                title: "Manage Attendance", url: "/dashboard/teacher/students",
                icon: undefined
              },
                {
                title: "Fees structure", url: "/dashboard/teacher/students/fees-structure",
                icon: undefined
              },

            ],
          },
          { title: "Profile", url: "/dashboard/profile", icon: <FaPersonBooth /> },
        ]

      case "student":
        return [
          ...commonItems,
          { title: "My Subjects", url: "/dashboard/student/subjects", icon: <FaBookOpen /> },
          { title: "Attendance", url: "/dashboard/student/attendance", icon: <FaCalendarAlt /> },
          { title: "Assignments", url: "/dashboard/student/assignments", icon: <FaFileAlt /> },
          { title: "Fees", url: "/dashboard/student/fees", icon: <FaDollarSign /> },
          { title: "Profile", url: "/dashboard/profile", icon: <FaPersonBooth /> },
        ]

      default:
        return commonItems
    }
  }

  const menuItems = getMenuItems()

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <FaGraduationCap className="h-6 w-6" />
          <span className="font-semibold">School MS</span>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          <p>
            {user?.firstName} {user?.lastName}
          </p>
          <p className="capitalize">{userRole}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="w-full flex items-center justify-between px-2 py-1 hover:bg-accent rounded-md"
                      >
                        <span className="flex items-center gap-2">
                          {item.icon}
                          {item.title}
                        </span>
                        {openMenus.includes(item.title) ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                      {openMenus.includes(item.title) && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((sub) => (
                            <a
                              key={sub.title}
                              href={sub.url}
                              className="block px-2 py-1 text-sm hover:bg-accent rounded-md"
                            >
                              {sub.title}
                            </a>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <SidebarMenuButton asChild>
                      <a href={item.url || "#"} className="flex items-center gap-2">
                        {item.icon}
                        {item.title}
                      </a>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button variant="outline" onClick={handleLogout} className="w-full bg-transparent">
          <FaSignOutAlt className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
