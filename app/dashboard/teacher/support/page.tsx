"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/ui/button"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { Label } from "@/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"

export default function Page() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [priority, setPriority] = useState("medium")
  const [date, setDate] = useState("")
  const [query, setQuery] = useState("")
  const [phone, setPhone] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !subject || !query) {
      toast.error("Please fill required fields: Email, Subject, Query")
      return
    }
    setIsSubmitting(true)
    try {
      // Placeholder submission. Wire to your API as needed.
      console.log({ email, subject, priority, date, query, phone })
      toast.success("Support request submitted")
      setEmail("")
      setSubject("")
      setPriority("medium")
      setDate("")
      setQuery("")
      setPhone("")
    } catch (err) {
      toast.error("Failed to submit support request")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Support</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="name@school.edu" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input id="phone" type="tel" placeholder="+91 90000 00000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Brief summary" value={subject} onChange={(e) => setSubject(e.target.value)} required />
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
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="query">Query / Description</Label>
            <Textarea id="query" placeholder="Describe your issue or request..." rows={6} value={query} onChange={(e) => setQuery(e.target.value)} required />
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


