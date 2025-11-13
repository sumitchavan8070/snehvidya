"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, PlusCircle, PencilLine, Trash2 } from "lucide-react"
import { api } from "@/lib/api"

type NullableNumber = number | null

interface RawFeeStructure {
  id?: number
  school_id: number
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

interface FeeOverride {
  class_name: string
  tuition_fee?: NullableNumber
  annual_fee?: NullableNumber
  q1?: NullableNumber
  q2?: NullableNumber
  q3?: NullableNumber
  q4?: NullableNumber
  services?: Array<{ id: string; name: string; amount: number }>
  notes?: string
  total_fee?: NullableNumber
}

const FEES_OVERRIDES_KEY = "sv_fee_structure_overrides"

const SERVICE_TEMPLATES: ServiceTemplate[] = [
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
]

export default function PrincipalFeesStructure() {
  const [baseFees, setBaseFees] = useState<RawFeeStructure[]>([])
  const [overrides, setOverrides] = useState<FeeOverride[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formState, setFormState] = useState<FormState | null>(null)

  useEffect(() => {
    const stored = loadOverrides()
    setOverrides(stored)
    fetchFees()
  }, [])

  const fees: FeeStructure[] = useMemo(() => {
    return applyOverrides(baseFees, overrides)
  }, [baseFees, overrides])

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

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await api.getFeesStructure()
      if (res.status !== 1 || !Array.isArray(res.result)) {
        toast.error("Failed to load fees structure data.")
        setBaseFees([])
        return
      }

      const mapped: RawFeeStructure[] = res.result.map((fee: any) => ({
        ...fee,
        tuition_fee: parseNumber(fee.tuition_fee),
        annual_fee: parseNumber(fee.annual_fee),
        total_fee: parseNumber(fee.total_fee),
        q1: parseNumber(fee.q1),
        q2: parseNumber(fee.q2),
        q3: parseNumber(fee.q3),
        q4: parseNumber(fee.q4),
      }))

      setBaseFees(mapped)
    } catch (error) {
      console.error("Error while fetching fees structure:", error)
      toast.error("Unable to fetch fees structure.")
    } finally {
      setLoading(false)
    }
  }

  const openDialogForFee = (fee?: FeeStructure) => {
    const baseServices = SERVICE_TEMPLATES.map<ServiceFormState>((template) => {
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
        .filter((item) => !SERVICE_TEMPLATES.some((template) => normalizeKey(item.name) === template.id) && item.category === "service")
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
      notes: (fee as any)?.notes ?? "",
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

    setIsSaving(true)
    try {
      const enabledServices = formState.services.filter((service) => service.enabled && service.name.trim())
      const formTotals = calculateTotals(formState, enabledServices)

      const override: FeeOverride = {
        class_name: formState.class_name,
        tuition_fee: formState.tuition_fee,
        annual_fee: formState.annual_fee,
        q1: formState.q1,
        q2: formState.q2,
        q3: formState.q3,
        q4: formState.q4,
        notes: formState.notes,
        total_fee: formTotals.total,
        services: enabledServices.map((service) => ({
          id: service.id,
          name: service.name,
          amount: service.amount,
        })),
      }

      const nextOverrides = upsertOverride(overrides, override)
      setOverrides(nextOverrides)
      persistOverrides(nextOverrides)

      // If this is a brand-new class not present in base data, append a stub so it appears in the table.
      if (!baseFees.some((fee) => fee.class_name === formState.class_name)) {
        setBaseFees((prev) => [
          ...prev,
          {
            id: Date.now(),
            school_id: 1,
            class_name: formState.class_name,
            tuition_fee: formState.tuition_fee,
            annual_fee: formState.annual_fee,
            total_fee: formTotals.total,
            q1: formState.q1,
            q2: formState.q2,
            q3: formState.q3,
            q4: formState.q4,
            additional_services: null,
            notes: formState.notes,
          },
        ])
      }

      toast.success("Fees structure saved for class " + formState.class_name)
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to save fees structure:", error)
      toast.error("Unable to save fees structure changes.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl">
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">Manage Fees Structure</h1>
          <p className="text-muted-foreground">
            Configure base fees and optional services such as transport, digital learning and hostel for every class.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <p>
              Core Fees:{" "}
              <span className="font-semibold">₹{(totalByCategory.core || 0).toLocaleString()}</span>
            </p>
            <p>
              Services:{" "}
              <span className="font-semibold">₹{(totalByCategory.service || 0).toLocaleString()}</span>
            </p>
          </div>
          <Button onClick={() => openDialogForFee()} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Class
          </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Current Structure Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table className="w-full">
              <TableHeader className="bg-gray-100 dark:bg-gray-800">
                <TableRow>
                  <TableHead>Class</TableHead>
                  <TableHead className="text-right">Tuition</TableHead>
                  <TableHead className="text-right">Annual</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Services Included</TableHead>
                  <TableHead className="text-right">Q1</TableHead>
                  <TableHead className="text-right">Q2</TableHead>
                  <TableHead className="text-right">Q3</TableHead>
                  <TableHead className="text-right">Q4</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      No fee structure configured yet. Use “Add Class” to create one.
                    </TableCell>
                  </TableRow>
                ) : (
                  fees.map((fee) => (
                    <TableRow key={fee.class_name}>
                      <TableCell className="font-semibold">{fee.class_name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.tuition_fee)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.annual_fee)}</TableCell>
                      <TableCell className="text-right font-semibold text-blue-600">
                        {formatCurrency(fee.total_fee)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {fee.services.map((service) => (
                            <Badge
                              key={`${fee.class_name}-${service.name}`}
                              variant={service.category === "service" ? "outline" : "default"}
                            >
                              {service.name}: ₹{service.amount.toLocaleString()}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.q1)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.q2)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.q3)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(fee.q4)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="gap-1 text-blue-600" onClick={() => openDialogForFee(fee)}>
                          <PencilLine className="h-4 w-4" />
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{formState?.id ? "Update Fees Structure" : "Create Fees Structure"}</DialogTitle>
          </DialogHeader>
          {formState && (
            <div className="space-y-6">
              <section className="grid gap-4 md:grid-cols-2">
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
                <div className="grid grid-cols-2 gap-4">
                  {(["q1", "q2", "q3", "q4"] as const).map((quarter) => (
                    <div key={quarter}>
                      <Label className="uppercase">{quarter}</Label>
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
              </section>

              <section>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Services & Add-ons</h3>
                    <p className="text-sm text-muted-foreground">
                      Enable the services offered to this class and set their amounts.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddCustomService}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Custom Service
                  </Button>
                </div>

                <div className="mt-4 space-y-4">
                  {formState.services.map((service) => (
                    <div key={service.id} className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:gap-6">
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
                            />
                          ) : (
                            <span className="font-medium">{service.name}</span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {service.description ||
                            (service.isCustom ? "Describe the additional service included in the ID card." : "")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input
                          className="w-28"
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
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  return key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function applyOverrides(baseFees: RawFeeStructure[], overrides: FeeOverride[]): FeeStructure[] {
  return baseFees
    .filter((fee) => fee.class_name)
    .map((fee) => {
      const optionalServices = parseOptionalServices(fee.additional_services)
      const override = overrides.find((item) => item.class_name === fee.class_name)

      const tuition = override?.tuition_fee ?? fee.tuition_fee ?? 0
      const annual = override?.annual_fee ?? fee.annual_fee ?? 0
      const overrideServices =
        override?.services?.map<ServiceBreakdown>((service) => ({
          name: service.name,
          amount: service.amount,
          category: "service",
        })) ?? optionalServices

      const total =
        override?.total_fee ??
        tuition +
          annual +
          overrideServices.reduce((acc, service) => acc + (Number.isFinite(service.amount) ? service.amount : 0), 0)

      return {
        ...fee,
        tuition_fee: tuition,
        annual_fee: annual,
        total_fee: total,
        q1: override?.q1 ?? fee.q1,
        q2: override?.q2 ?? fee.q2,
        q3: override?.q3 ?? fee.q3,
        q4: override?.q4 ?? fee.q4,
        services: [
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
          ...overrideServices,
        ],
        notes: override?.notes ?? fee.notes,
      }
    })
    .sort((a, b) => a.class_name.localeCompare(b.class_name))
}

function loadOverrides(): FeeOverride[] {
  if (typeof window === "undefined") return []
  try {
    const stored = window.localStorage.getItem(FEES_OVERRIDES_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch (error) {
    console.warn("Failed to load stored fee overrides:", error)
    return []
  }
}

function persistOverrides(overrides: FeeOverride[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(FEES_OVERRIDES_KEY, JSON.stringify(overrides))
  } catch (error) {
    console.warn("Failed to persist fee overrides:", error)
  }
}

function upsertOverride(overrides: FeeOverride[], updated: FeeOverride) {
  const existingIndex = overrides.findIndex((item) => item.class_name === updated.class_name)
  if (existingIndex >= 0) {
    const copy = [...overrides]
    copy[existingIndex] = { ...copy[existingIndex], ...updated }
    return copy
  }
  return [...overrides, updated]
}

function calculateTotals(state: FormState, services: ServiceFormState[]) {
  const tuition = Number(state.tuition_fee ?? 0)
  const annual = Number(state.annual_fee ?? 0)
  const serviceTotal = services.reduce((acc, service) => acc + (Number.isFinite(service.amount) ? service.amount : 0), 0)
  const total = tuition + annual + serviceTotal
  return { tuition, annual, serviceTotal, total }
}

function formatCurrency(value: NullableNumber) {
  if (value === null || value === undefined) return "-"
  return `₹${Number(value).toLocaleString()}`
}

