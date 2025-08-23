// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { Home, Users, Calendar, DollarSign, Settings, LogOut, Menu, X } from "lucide-react"

// interface User {
//   id: number
//   email: string
//   first_name: string
//   last_name: string
//   role: string
// }

// interface DashboardLayoutProps {
//   children: React.ReactNode
// }

// export default function DashboardLayout({ children }: DashboardLayoutProps) {
//   const [user, setUser] = useState<User | null>(null)
//   const [sidebarOpen, setSidebarOpen] = useState(false)
//   const router = useRouter()

//   useEffect(() => {
//     const userData = localStorage.getItem("user")
//     if (userData) {
//       setUser(JSON.parse(userData))
//     } else {
//       router.push("/login")
//     }
//   }, [router])

//   const handleLogout = () => {
//     localStorage.removeItem("token")
//     localStorage.removeItem("user")
//     router.push("/login")
//   }

//   const navigation = [
//     { name: "Dashboard", href: `/dashboard/${user?.role}`, icon: Home },
//     { name: "Users", href: "/dashboard/users", icon: Users },
//     { name: "Attendance", href: "/dashboard/attendance", icon: Calendar },
//     { name: "Fees", href: "/dashboard/fees", icon: DollarSign },
//     { name: "Settings", href: "/dashboard/settings", icon: Settings },
//   ]

//   if (!user) {
//     return <div>Loading...</div>
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Mobile sidebar */}
//       <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
//         <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
//         <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
//           <div className="flex h-16 items-center justify-between px-4">
//             <h1 className="text-xl font-bold">School MS</h1>
//             <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)}>
//               <X className="h-6 w-6" />
//             </Button>
//           </div>
//           <nav className="flex-1 space-y-1 px-2 py-4">
//             {navigation.map((item) => (
//               <a
//                 key={item.name}
//                 href={item.href}
//                 className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//               >
//                 <item.icon className="mr-3 h-6 w-6" />
//                 {item.name}
//               </a>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Desktop sidebar */}
//       <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
//         <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
//           <div className="flex h-16 items-center px-4">
//             <h1 className="text-xl font-bold">School Management</h1>
//           </div>
//           <nav className="flex-1 space-y-1 px-2 py-4">
//             {navigation.map((item) => (
//               <a
//                 key={item.name}
//                 href={item.href}
//                 className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
//               >
//                 <item.icon className="mr-3 h-6 w-6" />
//                 {item.name}
//               </a>
//             ))}
//           </nav>
//         </div>
//       </div>

//       {/* Main content */}
//       <div className="lg:pl-64">
//         {/* Top bar */}
//         <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
//           <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
//             <Menu className="h-6 w-6" />
//           </Button>

//           <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
//             <div className="flex flex-1" />
//             <div className="flex items-center gap-x-4 lg:gap-x-6">
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                     <Avatar className="h-8 w-8">
//                       <AvatarImage src="/placeholder.svg" alt={user.first_name} />
//                       <AvatarFallback>
//                         {user.first_name}
//                         {user.last_name}
//                       </AvatarFallback>
//                     </Avatar>
//                   </Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent className="w-56" align="end" forceMount>
//                   <DropdownMenuLabel className="font-normal">
//                     <div className="flex flex-col space-y-1">
//                       <p className="text-sm font-medium leading-none">
//                         {user.first_name} {user.last_name}
//                       </p>
//                       <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
//                       <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
//                     </div>
//                   </DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={handleLogout}>
//                     <LogOut className="mr-2 h-4 w-4" />
//                     <span>Log out</span>
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>
//             </div>
//           </div>
//         </div>

//         {/* Page content */}
//         <main className="py-10">
//           <div className="px-4 sm:px-6 lg:px-8">{children}</div>
//         </main>
//       </div>
//     </div>
//   )
// }
