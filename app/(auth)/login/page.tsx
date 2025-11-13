// "use client"

// import React, { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { toast } from "sonner"
// import { HttpClientService } from "@/app/request/http-client.service" // ✅ import service

// // ✅ Instantiate it (you can also move this to a separate lib/api.ts file later)

// const httpClient = new HttpClientService();


// export default function LoginPage() {
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()
//   // const httpClient = new HttpClientService(); 


//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)

//     try {

//       const postData = { email, password }
//       const response = await httpClient.postRequest("/auth/client-login", postData)

//       if (response.status === 0) {
//         toast.error(response.message)
//         return
//       }

//       if (response.access_token) {
//         // Save token
//         httpClient.setToken(response.access_token)
//         localStorage.setItem("token", response.access_token)
//         localStorage.setItem("user", JSON.stringify(response.user))

//         toast.success("Login successful!")

//         const role = response.user?.role?.name?.toLowerCase()
//         router.push(`/dashboard/${role || "admin"}`)
//       }
//     } catch (error) {
//       console.error("Login error:", error)
//       toast.error("Something went wrong, please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl text-center">School Management System</CardTitle>
//           <CardDescription className="text-center">
//             Enter your credentials to access your account
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="password">Password</Label>
//               <Input
//                 id="password"
//                 type="password"
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//             </div>
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading ? "Signing in..." : "Sign In"}
//             </Button>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }


"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // ✅ Import Image component
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { HttpClientService } from "@/app/request/http-client.service"

const httpClient = new HttpClientService();

// ✅ Import your logo image here
import Logo from "@/public/snehvidya_logo.png"; // Adjust the path as needed

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const postData = { email, password }
      const response = await httpClient.postRequest("/auth/client-login", postData)

      if (response.status === 0) {
        toast.error(response.message)
        return
      }

      if (response.access_token) {
        // Save token
        httpClient.setToken(response.access_token)
        localStorage.setItem("token", response.access_token)
        localStorage.setItem("user", JSON.stringify(response.user))

        toast.success("Login successful!")

        const role = response.user?.role?.name?.toLowerCase()
        router.push(`/dashboard/${role || "admin"}`)
      }
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Something went wrong, please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          {/* ✅ Add the logo */}
          <div className="flex justify-center">
            <Image
              src="/snehvidya_logo.png" // ⚠️ Replace with the actual path to your logo file
              alt="School Logo"
              width={120} // Set appropriate width
              height={120} // Set appropriate height
              className="mb-4 rounded-full"
            />
          </div>

          <CardTitle className="text-2xl text-center">School Management System</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}