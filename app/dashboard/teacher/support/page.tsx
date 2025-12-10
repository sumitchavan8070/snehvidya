"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { Label } from "@/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import { api } from "@/lib/api"

export default function Page() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState("medium")
  const [date, setDate] = useState("")
  const [query, setQuery] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isCheckingAccess, setIsCheckingAccess] = useState(true)

  // Check user role and prevent students from accessing
  useEffect(() => {
    const checkAccess = () => {
      try {
        const userData = localStorage.getItem("user")
        if (!userData) {
          router.push("/login")
          return
        }

        const user = JSON.parse(userData)
        const userRole = user?.role?.name?.toLowerCase() || ""

        // Block students from accessing support page
        if (userRole === "student") {
          toast.error("Access denied. This page is not available for students.")
          router.push("/dashboard/student")
          return
        }

        setIsCheckingAccess(false)
      } catch (error) {
        console.error("Error checking access:", error)
        router.push("/login")
      }
    }

    checkAccess()
  }, [router])

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Format date from YYYY-MM-DD to MM/DD/YYYY
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
  }

  // Capitalize first letter of priority
  const formatPriority = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required"
    }

    if (!query.trim()) {
      newErrors.query = "Query/Description is required"
    }

    if (!date) {
      newErrors.date = "Date is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      // Format the data according to API requirements
      const formattedDate = formatDate(date)
      const formattedPriority = formatPriority(priority)

      const payload = {
        email: email.trim(),
        phone: phone.trim() || "+91 90000 00000", // Default if empty
        subject: subject.trim(),
        priority: formattedPriority,
        date: formattedDate,
        query: query.trim(),
      }

      console.log("Submitting support query:", payload)

      const res = await api.sendClientQuery(payload)

      // Check if API call was successful
      if (res && (res.status === 1 || res.success || res.statusCode === 200)) {
        toast.success("your request has been updated successfully")
        
        // Reset form
        setEmail("")
        setSubject("")
        setPriority("medium")
        setDate("")
        setQuery("")
        setPhone("")
      } else {
        toast.error(res?.message || "Failed to submit support request")
      }
    } catch (err: any) {
      console.error("Error submitting support request:", err)
      toast.error(err?.message || "Failed to submit support request. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show loading while checking access
  if (isCheckingAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Support</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="name@school.edu" 
              value={email} 
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors(prev => ({ ...prev, email: "" }))
              }}
              className={errors.email ? "border-red-500" : ""}
              required 
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+91 90000 00000" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
            <Input 
              id="subject" 
              placeholder="Brief summary" 
              value={subject} 
              onChange={(e) => {
                setSubject(e.target.value)
                if (errors.subject) setErrors(prev => ({ ...prev, subject: "" }))
              }}
              className={errors.subject ? "border-red-500" : ""}
              required 
            />
            {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
            <Input 
              id="date" 
              type="date" 
              value={date} 
              onChange={(e) => {
                setDate(e.target.value)
                if (errors.date) setErrors(prev => ({ ...prev, date: "" }))
              }}
              className={errors.date ? "border-red-500" : ""}
              required
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="query">Query / Description <span className="text-red-500">*</span></Label>
            <Textarea 
              id="query" 
              placeholder="Describe your issue or request..." 
              rows={6} 
              value={query} 
              onChange={(e) => {
                setQuery(e.target.value)
                if (errors.query) setErrors(prev => ({ ...prev, query: "" }))
              }}
              className={errors.query ? "border-red-500" : ""}
              required 
            />
            {errors.query && <p className="text-sm text-red-500">{errors.query}</p>}
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit"}</Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-lg font-medium mb-2">Contact & Support Details</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">Email: support@school.edu</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Phone: +91 90000 00000</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">Hours: Mon–Fri, 9:00–18:00</p>
      </div>
    </div>
  )
}


