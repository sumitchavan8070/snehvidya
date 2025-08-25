"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import {
  Table, TableHeader, TableRow, TableHead, TableCell, TableBody
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { api } from "@/lib/api"

interface FeeStructure {
  id?: number
  school_id: number
  class_name: string
  tuition_fee: number
  annual_fee: number
  total_fee: number
  q1: number
  q2: number
  q3: number
  q4: number 
}

export default function FeesStructureManagement() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [loading, setLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFee, setEditingFee] = useState<FeeStructure | null>(null)
  const [formData, setFormData] = useState<Partial<FeeStructure>>({})

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesStructure()
      // const data = await res.json()

      if (res.status !== 1) {
        toast.error("Failed to load fees")
        return
      }

      const parsedFees: FeeStructure[] = res.result.map((fee: any) => ({
        ...fee,
        tuition_fee: parseFloat(fee.tuition_fee),
        annual_fee: parseFloat(fee.annual_fee),
        total_fee: parseFloat(fee.total_fee),
        q1: parseFloat(fee.q1),
        q2: parseFloat(fee.q2),
        q3: parseFloat(fee.q3),
        q4:  parseFloat(fee.q4),
      }))

      setFees(parsedFees)
    } catch (err) {
      console.error(err)
      toast.error("Error fetching fees")
      setFees([])
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (fee: FeeStructure) => {
    setEditingFee(fee)
    setFormData(fee)
    setDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingFee(null)
    setFormData({})
    setDialogOpen(true)
  }

  // const handleSave = async () => {
  //   setIsSaving(true)
  //   try {
  //     if (!formData.class_name) {
  //       toast.error("Class name is required")
  //       setIsSaving(false)
  //       return
  //     }

  //     // numeric validation (allow 0 but not undefined/null)
  //     const requiredNumbers = ["tuition_fee", "annual_fee", "total_fee", "q1", "q2", "q3"]
  //     for (const field of requiredNumbers) {
  //       const value = (formData as any)[field]
  //       if (value === undefined || value === null || isNaN(value)) {
  //         toast.error(`${field} is required and must be a number`)
  //         setIsSaving(false)
  //         return
  //       }
  //     }

  //     let res: Response
  //     if (editingFee?.id) {
  //       res = await api.updateFeesStructure(editingFee.id, formData)
  //     } else {
  //       res = await api.postFeesStructure({ ...formData, school_id: 1 }) // TODO: replace with actual school_id
  //     }

  //     const data = await res.json()
  //     if (data.status === 1 || data.success) {
  //       toast.success(`Fee ${editingFee ? "updated" : "added"} successfully!`)
  //       setDialogOpen(false)
  //       fetchFees()
  //     } else {
  //       toast.error(`Failed to ${editingFee ? "update" : "add"} fee.`)
  //     }
  //   } catch (err) {
  //     console.error(err)
  //     toast.error("Error saving fee.")
  //   } finally {
  //     setIsSaving(false)
  //   }
  // }  

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Fees Structure
        </h1>
        <Button
          onClick={handleAddNew}
          className="hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105"
        >
          + Add New Fee
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Current Fees Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Tuition Fee</TableHead>
                  <TableHead className="text-right">Annual Fee</TableHead>
                  <TableHead className="text-right">Total Fee</TableHead>
                  <TableHead className="text-right">Q1</TableHead>
                  <TableHead className="text-right">Q2</TableHead>
                  <TableHead className="text-right">Q3</TableHead>
                  <TableHead className="text-right">Q4</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10">
                      <div className="flex items-center justify-center space-x-2 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading fees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : fees.length > 0 ? (
                  fees.map(fee => (
                    <TableRow
                      key={fee.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                      onClick={() => handleEdit(fee)}
                    >
                      <TableCell>{fee.class_name}</TableCell>
                      <TableCell className="text-right">₹{fee.tuition_fee.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{fee.annual_fee.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold text-blue-600">₹{fee.total_fee.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{fee.q1.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{fee.q2.toLocaleString()}</TableCell>
                      <TableCell className="text-right">₹{fee.q3.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{fee.q4.toLocaleString() ?? ""}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => { e.stopPropagation(); handleEdit(fee) }}
                          className="text-blue-600 hover:bg-blue-100"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                      No fees structure found. Click "Add New Fee" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingFee ? "Edit Fee" : "Add New Fee"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
            <div className="col-span-full">
              <Label htmlFor="class_name">Class Name</Label>
              <Input
                id="class_name"
                value={formData.class_name || ""}
                onChange={e => setFormData({ ...formData, class_name: e.target.value })}
              />
            </div>
            {["tuition_fee", "annual_fee", "total_fee", "q1", "q2", "q3", "q4"].map((field, idx) => (
              <div key={field} className={idx === 2 ? "col-span-full" : ""}>
                <Label htmlFor={field}>{field.toUpperCase()}</Label>
                <Input
                  id={field}
                  type="number"
                  value={(formData as any)[field] ?? ""}
                  onChange={e => setFormData({ ...formData, [field]: e.target.value ? Number(e.target.value) : null })}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>Cancel</Button>
            {/* <Button onClick=({}) disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
