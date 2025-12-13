"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, PencilLine, Trash2, Calculator, Settings } from "lucide-react"
import { api } from "@/lib/api"
import { SectionExtraFeesDialog } from "./section-extra-fees-dialog"

type NullableNumber = number | null

interface RawFeeStructure {
  id?: number
  school_id?: number
  class_name: string
  tuition_fee: NullableNumber
  annual_fee: NullableNumber
  total_fee: NullableNumber
  q1: NullableNumber
  q2: NullableNumber
  q3: NullableNumber
  q4: NullableNumber
  additional_services?: Record<string, any> | string | null
  notes?: string | null
}

interface ServiceBreakdown {
  name: string
  amount: number
  category: "core" | "service"
}

interface FeeStructure extends RawFeeStructure {
  services: ServiceBreakdown[]
}

interface ServiceTemplate {
  id: string
  name: string
  description: string
  mandatory?: boolean
  defaultAmount?: number
}

interface ServiceFormState {
  id: string
  name: string
  amount: number
  enabled: boolean
  description?: string
  isCustom?: boolean
}

interface FormState {
  id?: number
  class_name: string
  tuition_fee: NullableNumber
  annual_fee: NullableNumber
  q1: NullableNumber
  q2: NullableNumber
  q3: NullableNumber
  q4: NullableNumber
  services: ServiceFormState[]
  notes: string
}

export default function PrincipalFeesStructure() {
  const [fees, setFees] = useState<FeeStructure[]>([])
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<FeeStructure | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [formState, setFormState] = useState<FormState | null>(null)
  const [sectionExtraFeesDialogOpen, setSectionExtraFeesDialogOpen] = useState(false)
  const [selectedClassForExtraFees, setSelectedClassForExtraFees] = useState<string>("")
  const [schoolId, setSchoolId] = useState<number | null>(null)
  const hasFetchedRef = useRef(false)

  // Get school_id from user data
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user")
      if (userStr) {
        const user = JSON.parse(userStr)
        setSchoolId(user?.school?.id || user?.schoolId || 1)
      }
    } catch (error) {
      console.error("Error getting school_id:", error)
      setSchoolId(1) // Default fallback
    }
  }, [])

  useEffect(() => {
    if (hasFetchedRef.current) {
      return
    }
    hasFetchedRef.current = true
    fetchFees()
    fetchServices()
  }, [])

  // Calculate totals
  const totalByCategory = useMemo(() => {
    return fees.reduce(
      (acc, fee) => {
        fee.services.forEach((service) => {
          acc[service.category] = (acc[service.category] || 0) + service.amount
        })
        return acc
      },
      {} as Record<ServiceBreakdown["category"], number>
    )
  }, [fees])

  const grandTotal = useMemo(() => {
    return fees.reduce((sum, fee) => sum + (fee.total_fee || 0), 0)
  }, [fees])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesStructure()
      // Backend returns: { status: 1, message: "success", result: [...] }
      if (res.status !== 1 || !Array.isArray(res.result)) {
        toast.error(res.message || "Failed to load fees structure data.")
        setFees([])
        return
      }

      const mapped: FeeStructure[] = res.result.map((fee: any) => {
        const tuition = parseNumber(fee.tuition_fee) || 0
        const annual = parseNumber(fee.annual_fee) || 0
        // Backend doesn't return additional_services in the same format
        // We'll create services from the fee data
        const additionalServices: ServiceBreakdown[] = []

        const services: ServiceBreakdown[] = [
          {
            name: "Tuition",
            amount: tuition,
            category: "core",
          },
          {
            name: "Annual",
            amount: annual,
            category: "core",
          },
          ...additionalServices,
        ]

        return {
          ...fee,
          id: fee.id,
          school_id: fee.school_id || schoolId || 1,
          tuition_fee: parseNumber(fee.tuition_fee),
          annual_fee: parseNumber(fee.annual_fee),
          total_fee: parseNumber(fee.total_fee),
          q1: parseNumber(fee.q1),
          q2: parseNumber(fee.q2),
          q3: parseNumber(fee.q3),
          q4: parseNumber(fee.q4),
          services,
        }
      })

      setFees(mapped)
    } catch (error) {
      console.error("Error while fetching fees structure:", error)
      toast.error("Unable to fetch fees structure.")
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    setLoadingServices(true)
    try {
      const res = await api.getFeeServices()
      if (res.status === 1 && Array.isArray(res.result)) {
        setServiceTemplates(
          res.result.map((s: any) => ({
            id: s.id?.toString() || normalizeKey(s.name),
            name: s.name,
            description: s.description || "",
            mandatory: s.mandatory || false,
            defaultAmount: s.defaultAmount || 0,
          }))
        )
      }
    } catch (error) {
      console.error("Error fetching services:", error)
      // Use default services if API fails
      setServiceTemplates([
        {
          id: "digital_learning",
          name: "Digital Learning Suite",
          description: "LMS, smart classroom subscription, e-books",
          defaultAmount: 1500,
        },
        {
          id: "transport",
          name: "School Transport",
          description: "Bus / cab facility",
          defaultAmount: 2500,
        },
        {
          id: "lab",
          name: "Laboratory Charges",
          description: "Science, computer and language lab maintenance",
          defaultAmount: 900,
        },
        {
          id: "activities",
          name: "Extracurricular Activities",
          description: "Clubs, sports, cultural programs",
          defaultAmount: 600,
        },
        {
          id: "hostel",
          name: "Hostel & Boarding",
          description: "Applicable for residential students",
          defaultAmount: 5000,
        },
        {
          id: "insurance",
          name: "Student Insurance",
          description: "Annual coverage for student safety",
          defaultAmount: 300,
        },
      ])
    } finally {
      setLoadingServices(false)
    }
  }

  const openDialogForFee = (fee?: FeeStructure) => {
    const baseServices = serviceTemplates.map<ServiceFormState>((template) => {
      const existing = fee?.services.find((item) => normalizeKey(item.name) === template.id)
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        amount: existing?.amount ?? template.defaultAmount ?? 0,
        enabled: existing ? true : false,
      }
    })

    const additionalServices =
      fee?.services
        .filter(
          (item) =>
            !serviceTemplates.some((template) => normalizeKey(item.name) === template.id) &&
            item.category === "service"
        )
        .map<ServiceFormState>((item) => ({
          id: `custom-${normalizeKey(item.name)}`,
          name: item.name,
          amount: item.amount,
          enabled: true,
          isCustom: true,
        })) ?? []

    const state: FormState = {
      id: fee?.id,
      class_name: fee?.class_name ?? "",
      tuition_fee: fee?.tuition_fee ?? 0,
      annual_fee: fee?.annual_fee ?? 0,
      q1: fee?.q1 ?? null,
      q2: fee?.q2 ?? null,
      q3: fee?.q3 ?? null,
      q4: fee?.q4 ?? null,
      services: [...baseServices, ...additionalServices],
      notes: fee?.notes ?? "",
    }

    setFormState(state)
    setDialogOpen(true)
  }

  const handleAddCustomService = () => {
    if (!formState) return
    setFormState({
      ...formState,
      services: [
        ...formState.services,
        {
          id: `custom-${Date.now()}`,
          name: "",
          amount: 0,
          enabled: true,
          isCustom: true,
        },
      ],
    })
  }

  const handleRemoveCustomService = (id: string) => {
    if (!formState) return
    setFormState({
      ...formState,
      services: formState.services.filter((service) => service.id !== id),
    })
  }

  const handleSave = async () => {
    if (!formState) return
    if (!formState.class_name.trim()) {
      toast.error("Class name is required.")
      return
    }
    if (!schoolId) {
      toast.error("School ID not found. Please refresh the page.")
      return
    }

    setIsSaving(true)
    try {
      const enabledServices = formState.services.filter((service) => service.enabled && service.name.trim())
      const formTotals = calculateTotals(formState, enabledServices)

      // Backend API format - matches the documentation
      const feesData = {
        school_id: schoolId,
        class_name: formState.class_name,
        tuition_fee: formState.tuition_fee || 0,
        annual_fee: formState.annual_fee || 0,
        total_fee: formTotals.total,
        q1: formState.q1 || null,
        q2: formState.q2 || null,
        q3: formState.q3 || null,
        q4: formState.q4 || null,
      }

      if (formState.id) {
        // Update existing - PATCH /mobileapi/v1/fees-structure/:school_id/:id
        const res = await api.updateFeesStructure(schoolId, formState.id, feesData)
        // Backend returns the updated object directly or with status
        if (res.id || res.status === 1) {
          toast.success("Fees structure updated successfully")
          setDialogOpen(false)
          fetchFees()
        } else {
          toast.error(res.message || res.error || "Failed to update fees structure")
        }
      } else {
        // Create new - POST /mobileapi/v1/fees-structure
        const res = await api.createFeesStructure(feesData)
        // Backend returns the created object directly or with status
        if (res.id || res.status === 1) {
          toast.success("Fees structure created successfully")
          setDialogOpen(false)
          fetchFees()
        } else {
          toast.error(res.message || res.error || "Failed to create fees structure")
        }
      }
    } catch (error: any) {
      console.error("Failed to save fees structure:", error)
      toast.error(error.message || "Unable to save fees structure changes.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteClick = (fee: FeeStructure) => {
    setDeleteTarget(fee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget?.id || !schoolId) return

    setIsDeleting(true)
    try {
      const res = await api.deleteFeesStructure(schoolId, deleteTarget.id)
      if (res.status === 1 || res.id) {
        toast.success("Fees structure deleted successfully")
        setDeleteDialogOpen(false)
        setDeleteTarget(null)
        fetchFees()
      } else {
        toast.error(res.message || res.error || "Failed to delete fees structure")
      }
    } catch (error: any) {
      console.error("Failed to delete fees structure:", error)
      toast.error(error.message || "Unable to delete fees structure.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="container mx-auto py-4 sm:py-6 lg:py-10 px-4 sm:px-6 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">Manage Fees Structure</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Configure base fees and optional services such as transport, digital learning and hostel for every class.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <p>
              Core Fees: <span className="font-semibold">₹{(totalByCategory.core || 0).toLocaleString()}</span>
            </p>
            <p>
              Services: <span className="font-semibold">₹{(totalByCategory.service || 0).toLocaleString()}</span>
            </p>
            <p className="font-bold text-base sm:text-lg text-primary">
              Grand Total: <span className="font-extrabold">₹{grandTotal.toLocaleString()}</span>
            </p>
          </div>
          <Button onClick={() => openDialogForFee()} className="gap-2 w-full sm:w-auto">
            <PlusCircle className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl font-semibold">Current Structure Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <Table className="w-full">
                <TableHeader className="bg-gray-100 dark:bg-gray-800">
                  <TableRow>
                    <TableHead className="min-w-[100px]">Class</TableHead>
                    <TableHead className="text-right min-w-[80px]">Tuition</TableHead>
                    <TableHead className="text-right min-w-[80px]">Annual</TableHead>
                    <TableHead className="text-right min-w-[100px] font-bold">Total</TableHead>
                    <TableHead className="min-w-[200px]">Services</TableHead>
                    <TableHead className="text-right min-w-[60px]">Q1</TableHead>
                    <TableHead className="text-right min-w-[60px]">Q2</TableHead>
                    <TableHead className="text-right min-w-[60px]">Q3</TableHead>
                    <TableHead className="text-right min-w-[60px]">Q4</TableHead>
                    <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10">
                        <div className="flex items-center justify-center space-x-2 text-gray-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading fees...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-10 text-gray-500">
                        No fee structure configured yet. Use "Add Class" to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fees.map((fee) => (
                      <TableRow key={fee.id || fee.class_name}>
                        <TableCell className="font-semibold">{fee.class_name}</TableCell>
                        <TableCell className="text-right">{formatCurrency(fee.tuition_fee)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(fee.annual_fee)}</TableCell>
                        <TableCell className="text-right font-semibold text-blue-600">
                          {formatCurrency(fee.total_fee)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {fee.services
                              .filter((s) => s.category === "service")
                              .map((service) => (
                                <Badge
                                  key={`${fee.id}-${service.name}`}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {service.name}: ₹{service.amount.toLocaleString()}
                                </Badge>
                              ))}
                            {fee.services.filter((s) => s.category === "service").length === 0 && (
                              <span className="text-xs text-muted-foreground">No services</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(fee.q1)}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(fee.q2)}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(fee.q3)}</TableCell>
                        <TableCell className="text-right text-xs sm:text-sm">{formatCurrency(fee.q4)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-green-600 h-8 px-2 sm:px-3"
                              onClick={() => {
                                setSelectedClassForExtraFees(fee.class_name)
                                setSectionExtraFeesDialogOpen(true)
                              }}
                              title="Manage section extra fees"
                            >
                              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Extra Fees</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-blue-600 h-8 px-2 sm:px-3"
                              onClick={() => openDialogForFee(fee)}
                            >
                              <PencilLine className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 h-8 px-2 sm:px-3 hover:text-red-700"
                              onClick={() => handleDeleteClick(fee)}
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formState?.id ? "Update Fees Structure" : "Create Fees Structure"}</DialogTitle>
          </DialogHeader>
          {formState && (
            <div className="space-y-6">
              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Class Name *</Label>
                  <Input
                    value={formState.class_name}
                    onChange={(event) =>
                      setFormState((prev) => (prev ? { ...prev, class_name: event.target.value } : prev))
                    }
                    placeholder="e.g. Grade 10 A"
                  />
                </div>
                <div>
                  <Label>Tuition Fee</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formState.tuition_fee ?? ""}
                    onChange={(event) =>
                      setFormState((prev) =>
                        prev ? { ...prev, tuition_fee: event.target.value ? Number(event.target.value) : null } : prev
                      )
                    }
                    placeholder="₹"
                  />
                </div>
                <div>
                  <Label>Annual Fee</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formState.annual_fee ?? ""}
                    onChange={(event) =>
                      setFormState((prev) =>
                        prev ? { ...prev, annual_fee: event.target.value ? Number(event.target.value) : null } : prev
                      )
                    }
                    placeholder="₹"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="uppercase text-xs sm:text-sm">Quarterly Distribution</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        if (!formState) return
                        const total = (formState.tuition_fee || 0) + (formState.annual_fee || 0)
                        if (total <= 0) {
                          toast.error("Please enter tuition or annual fee first")
                          return
                        }
                        try {
                          const res = await api.calculateQuarters(total, "equal")
                          if (res.status === 1) {
                            setFormState({
                              ...formState,
                              q1: res.result.q1,
                              q2: res.result.q2,
                              q3: res.result.q3,
                              q4: res.result.q4,
                            })
                            toast.success("Quarters calculated successfully")
                          }
                        } catch (error) {
                          toast.error("Failed to calculate quarters")
                        }
                      }}
                    >
                      <Calculator className="mr-2 h-4 w-4" />
                      Auto Calculate
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {(["q1", "q2", "q3", "q4"] as const).map((quarter) => (
                      <div key={quarter}>
                        <Label className="uppercase text-xs sm:text-sm">{quarter}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={formState[quarter] ?? ""}
                          onChange={(event) =>
                            setFormState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    [quarter]: event.target.value ? Number(event.target.value) : null,
                                  }
                                : prev
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">Services & Add-ons</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Enable the services offered to this class and set their amounts.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCustomService}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Custom Service
                  </Button>
                </div>

                <div className="mt-4 space-y-3 sm:space-y-4">
                  {formState.services.map((service) => (
                    <div
                      key={service.id}
                      className="flex flex-col gap-3 rounded-lg border p-3 sm:p-4 sm:flex-row sm:items-center sm:gap-6"
                    >
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={service.enabled}
                            onCheckedChange={(checked) =>
                              setFormState((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      services: prev.services.map((item) =>
                                        item.id === service.id ? { ...item, enabled: checked } : item
                                      ),
                                    }
                                  : prev
                              )
                            }
                          />
                          {service.isCustom ? (
                            <Input
                              value={service.name}
                              onChange={(event) =>
                                setFormState((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        services: prev.services.map((item) =>
                                          item.id === service.id ? { ...item, name: event.target.value } : item
                                        ),
                                      }
                                    : prev
                                )
                              }
                              placeholder="Custom service name"
                              className="flex-1"
                            />
                          ) : (
                            <span className="font-medium text-sm sm:text-base">{service.name}</span>
                          )}
                        </div>
                        {service.description && (
                          <p className="text-xs text-muted-foreground pl-8 sm:pl-10">{service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <Input
                          className="w-24 sm:w-28"
                          type="number"
                          min="0"
                          value={service.amount}
                          onChange={(event) =>
                            setFormState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    services: prev.services.map((item) =>
                                      item.id === service.id
                                        ? { ...item, amount: event.target.value ? Number(event.target.value) : 0 }
                                        : item
                                    ),
                                  }
                                : prev
                            )
                          }
                        />
                        {service.isCustom && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleRemoveCustomService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <Label>Internal Notes</Label>
                <Textarea
                  rows={3}
                  value={formState.notes}
                  onChange={(event) =>
                    setFormState((prev) => (prev ? { ...prev, notes: event.target.value } : prev))
                  }
                  placeholder="Optional: add remarks about special concessions or payment plans."
                />
              </section>

              {formState && (
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Calculated Total:</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{calculateTotals(formState, formState.services.filter((s) => s.enabled && s.name.trim())).total.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="mt-6 flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formState?.id ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the fees structure for <strong>{deleteTarget?.class_name}</strong>. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SectionExtraFeesDialog
        open={sectionExtraFeesDialogOpen}
        onOpenChange={setSectionExtraFeesDialogOpen}
        className={selectedClassForExtraFees}
        feesStructureId={fees.find((f) => f.class_name === selectedClassForExtraFees)?.id}
      />
    </div>
  )
}

function parseNumber(value: any): NullableNumber {
  if (value === null || value === undefined || value === "") return null
  const num = Number(value)
  return Number.isNaN(num) ? null : num
}

function normalizeKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_")
}

function parseOptionalServices(raw: RawFeeStructure["additional_services"]): ServiceBreakdown[] {
  if (!raw) return []
  let data: any = raw
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw)
    } catch (error) {
      console.warn("Failed to parse additional services JSON:", error)
      return []
    }
  }
  if (typeof data !== "object" || Array.isArray(data)) return []

  return Object.entries(data).reduce<ServiceBreakdown[]>((acc, [key, value]) => {
    const amount = typeof value === "number" ? value : parseFloat(value as any)
    if (!isNaN(amount)) {
      acc.push({
        name: formatServiceName(key),
        amount,
        category: "service",
      })
    }
    return acc
  }, [])
}

function formatServiceName(key: string) {
  return key.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function calculateTotals(state: FormState, services: ServiceFormState[]) {
  const tuition = Number(state.tuition_fee ?? 0)
  const annual = Number(state.annual_fee ?? 0)
  const serviceTotal = services.reduce(
    (acc, service) => acc + (Number.isFinite(service.amount) ? service.amount : 0),
    0
  )
  const total = tuition + annual + serviceTotal
  return { tuition, annual, serviceTotal, total }
}

function formatCurrency(value: NullableNumber) {
  if (value === null || value === undefined) return "-"
  return `₹${Number(value).toLocaleString()}`
}
