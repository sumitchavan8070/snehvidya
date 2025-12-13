"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, Trash2, Calculator } from "lucide-react"
import { api } from "@/lib/api"

interface SectionExtraFee {
  id?: number
  fees_structure_id?: number
  class_name: string
  section: string
  service_name: string
  amount: number
  q1: number | null
  q2: number | null
  q3: number | null
  q4: number | null
  is_active: boolean
}

interface SectionExtraFeesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className: string
  feesStructureId?: number
}

const SECTIONS = ["A", "B", "C", "D", "E", "F"]

export function SectionExtraFeesDialog({
  open,
  onOpenChange,
  className,
  feesStructureId,
}: SectionExtraFeesDialogProps) {
  const [extraFees, setExtraFees] = useState<SectionExtraFee[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newFee, setNewFee] = useState<Partial<SectionExtraFee>>({
    section: "",
    service_name: "",
    amount: 0,
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    is_active: true,
  })

  useEffect(() => {
    if (open && className) {
      fetchExtraFees()
    }
  }, [open, className])

  const fetchExtraFees = async () => {
    setLoading(true)
    try {
      const res = await api.getSectionExtraFees({ class_name: className })
      if (res.status === 1) {
        setExtraFees(res.result || [])
      }
    } catch (error) {
      console.error("Error fetching section extra fees:", error)
      toast.error("Failed to load section extra fees")
    } finally {
      setLoading(false)
    }
  }

  const handleCalculateQuarters = async (amount: number) => {
    try {
      const res = await api.calculateQuarters(amount, "equal")
      if (res.status === 1) {
        setNewFee({
          ...newFee,
          q1: res.result.q1,
          q2: res.result.q2,
          q3: res.result.q3,
          q4: res.result.q4,
        })
        toast.success("Quarters calculated successfully")
      }
    } catch (error) {
      console.error("Error calculating quarters:", error)
      toast.error("Failed to calculate quarters")
    }
  }

  const handleAddFee = async () => {
    if (!newFee.section || !newFee.service_name || !newFee.amount || newFee.amount <= 0) {
      toast.error("Please fill all required fields")
      return
    }

    setSaving(true)
    try {
      const feeData = {
        fees_structure_id: feesStructureId,
        class_name: className,
        section: newFee.section,
        service_name: newFee.service_name,
        amount: newFee.amount,
        q1: newFee.q1,
        q2: newFee.q2,
        q3: newFee.q3,
        q4: newFee.q4,
      }

      const res = await api.createSectionExtraFee(feeData)
      if (res.status === 1) {
        toast.success("Section extra fee added successfully")
        setNewFee({
          section: "",
          service_name: "",
          amount: 0,
          q1: null,
          q2: null,
          q3: null,
          q4: null,
          is_active: true,
        })
        fetchExtraFees()
      } else {
        toast.error(res.error || "Failed to add section extra fee")
      }
    } catch (error: any) {
      console.error("Error adding section extra fee:", error)
      toast.error(error.message || "Failed to add section extra fee")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteFee = async (id: number) => {
    if (!confirm("Are you sure you want to delete this extra fee?")) return

    try {
      const res = await api.deleteSectionExtraFee(id)
      if (res.status === 1) {
        toast.success("Section extra fee deleted successfully")
        fetchExtraFees()
      } else {
        toast.error(res.error || "Failed to delete section extra fee")
      }
    } catch (error: any) {
      console.error("Error deleting section extra fee:", error)
      toast.error(error.message || "Failed to delete section extra fee")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Section Extra Fees - {className}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Extra Fee Form */}
          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-semibold">Add Extra Fee for Section</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Section *</Label>
                <Select
                  value={newFee.section || ""}
                  onValueChange={(value) => setNewFee({ ...newFee, section: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTIONS.map((section) => (
                      <SelectItem key={section} value={section}>
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Name *</Label>
                <Input
                  value={newFee.service_name || ""}
                  onChange={(e) => setNewFee({ ...newFee, service_name: e.target.value })}
                  placeholder="e.g., School Transport"
                />
              </div>

              <div>
                <Label>Total Amount *</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={newFee.amount || ""}
                    onChange={(e) => {
                      const amount = Number(e.target.value) || 0
                      setNewFee({ ...newFee, amount })
                    }}
                    placeholder="₹"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => newFee.amount && handleCalculateQuarters(newFee.amount)}
                    title="Auto-calculate quarters"
                  >
                    <Calculator className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-xs">Q1</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newFee.q1 ?? ""}
                    onChange={(e) =>
                      setNewFee({ ...newFee, q1: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Q2</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newFee.q2 ?? ""}
                    onChange={(e) =>
                      setNewFee({ ...newFee, q2: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Q3</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newFee.q3 ?? ""}
                    onChange={(e) =>
                      setNewFee({ ...newFee, q3: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Q4</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newFee.q4 ?? ""}
                    onChange={(e) =>
                      setNewFee({ ...newFee, q4: e.target.value ? Number(e.target.value) : null })
                    }
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleAddFee} disabled={saving} className="w-full sm:w-auto">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Extra Fee
            </Button>
          </div>

          {/* Existing Extra Fees Table */}
          <div>
            <h3 className="font-semibold mb-4">Existing Section Extra Fees</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : extraFees.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No extra fees configured yet</p>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Section</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Q1</TableHead>
                      <TableHead className="text-right">Q2</TableHead>
                      <TableHead className="text-right">Q3</TableHead>
                      <TableHead className="text-right">Q4</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extraFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">Section {fee.section}</TableCell>
                        <TableCell>{fee.service_name}</TableCell>
                        <TableCell className="text-right">₹{fee.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{fee.q1 ? `₹${fee.q1.toLocaleString()}` : "-"}</TableCell>
                        <TableCell className="text-right">{fee.q2 ? `₹${fee.q2.toLocaleString()}` : "-"}</TableCell>
                        <TableCell className="text-right">{fee.q3 ? `₹${fee.q3.toLocaleString()}` : "-"}</TableCell>
                        <TableCell className="text-right">{fee.q4 ? `₹${fee.q4.toLocaleString()}` : "-"}</TableCell>
                        <TableCell>
                          <Badge variant={fee.is_active ? "default" : "secondary"}>
                            {fee.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => fee.id && handleDeleteFee(fee.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

