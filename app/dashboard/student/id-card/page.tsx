"use client"

import React, { useState, useRef } from "react"
import { toast } from "sonner"
import { Input } from "@/ui/input"
import { Textarea } from "@/ui/textarea"
import { Button } from "@/ui/button"
import { Label } from "@/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select"
import PaymentButton from "@/app/payments/_components/PaymentButton"

export default function Page() {
  const [studentId, setStudentId] = useState("")
  const [fullName, setFullName] = useState("")
  const [dob, setDob] = useState("")
  const [className, setClassName] = useState("")
  const [section, setSection] = useState("")
  const [bloodGroup, setBloodGroup] = useState("")
  const [address, setAddress] = useState("")
  const [parentName, setParentName] = useState("")
  const [parentPhone, setParentPhone] = useState("")
  const [emergencyPhone, setEmergencyPhone] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [validTill, setValidTill] = useState("")
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const ID_FEES = 229 // Fixed price

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setPhotoFile(file)
    if (file) {
      const url = URL.createObjectURL(file)
      setPhotoPreview(url)
    } else {
      setPhotoPreview(null)
    }
  }

  const resetForm = () => {
    setStudentId("")
    setFullName("")
    setDob("")
    setClassName("")
    setSection("")
    setBloodGroup("")
    setAddress("")
    setParentName("")
    setParentPhone("")
    setEmergencyPhone("")
    setIssueDate("")
    setValidTill("")
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!studentId || !fullName || !className || !section || !dob) {
      toast.error("Please fill required fields: ID, Name, Class, Section, DOB")
      return
    }

    if (!photoFile) {
      toast.error("Please upload a photo")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("studentId", studentId)
      formData.append("fullName", fullName)
      formData.append("dob", dob)
      formData.append("className", className)
      formData.append("section", section)
      formData.append("bloodGroup", bloodGroup)
      formData.append("address", address)
      formData.append("parentName", parentName)
      formData.append("parentPhone", parentPhone)
      formData.append("emergencyPhone", emergencyPhone)
      formData.append("issueDate", issueDate)
      formData.append("validTill", validTill)
      formData.append("photo", photoFile)

      console.log("Submitting ID card application...")

      toast.success("ID card application submitted")

    } catch (err) {
      toast.error("Failed to submit application")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">ID Card Application</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
        <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-3">

          {/* Section Heading */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-semibold">Student Details</h2>
          </div>
             {/* Photo Upload */}
          <div className="space-y-2 md:col-span-3">
            <Label>Photo</Label>
            <div className="flex items-start gap-4">
              <div className="w-28 h-28 rounded border bg-gray-50 overflow-hidden">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center justify-center w-full h-full text-xs text-gray-400">No photo</span>
                )}
              </div>
              <div className="flex-1 space-y-2">  
                <Input ref={fileInputRef} type="file" accept="image/*" onChange={onPhotoChange} />
                <p className="text-xs text-muted-foreground">Accepted: JPG, PNG • Max 2MB</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Student ID</Label>
            <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
          </div>
          

          <div className="space-y-2 md:col-span-2">
            <Label>Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>
            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="9">9</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="12">12</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Section</Label>
            <Select value={section} onValueChange={setSection}>
              <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Blood Group</Label>
            <Select value={bloodGroup} onValueChange={setBloodGroup}>
              <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
              <SelectContent>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(bg => (
                  <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-3">
            <Label>Address</Label>
            <Textarea rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          {/* Guardian Details */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-semibold">Guardian & Emergency</h2>
          </div>

          <div className="space-y-2">
            <Label>Parent/Guardian Name</Label>
            <Input value={parentName} onChange={(e) => setParentName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Parent Phone</Label>
            <Input type="tel" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Emergency Phone</Label>
            <Input type="tel" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
          </div>

          {/* ID Details */}
          <div className="md:col-span-3">
            <h2 className="text-lg font-semibold">ID Card Details</h2>
          </div>

          <div className="space-y-2">
            <Label>Issue Date</Label>
            <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Valid Till</Label>
            <Input type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} />
          </div>

       

          {/* Payment Section */}
          <div className="md:col-span-3 mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-white/5">
            <h2 className="text-lg font-semibold mb-2">ID Card Fees</h2>
            <p className="text-sm mb-3">Total Fees: <span className="font-bold text-green-600">₹{ID_FEES}</span></p>
            <PaymentButton amount="" key="test" />
          </div>

          {/* Submit + Reset */}
          <div className="md:col-span-3 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>Reset</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </div>

        </form>
      </div>
    </div>
  )
}
