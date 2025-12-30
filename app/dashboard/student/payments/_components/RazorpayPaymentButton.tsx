"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { api } from "@/lib/api"
import { CreditCard, Loader2 } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface Fee {
  id: number
  fee_type: string
  term: string
  amount: number
  paid?: number
  pending?: number
  status: string
  due_date: string
  [key: string]: any // Allow additional properties
}

interface RazorpayPaymentButtonProps {
  fee: Fee
  amount: number
  onSuccess?: () => void
}

export default function RazorpayPaymentButton({ fee, amount, onSuccess }: RazorpayPaymentButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    script.onload = () => {
      setRazorpayLoaded(true)
    }
    script.onerror = () => {
      toast.error("Failed to load Razorpay. Please refresh the page.")
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast.error("Razorpay is still loading. Please wait...")
      return
    }

    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded. Please refresh the page.")
      return
    }

    setIsLoading(true)

    try {
      // Get user data for prefill
      const userData = localStorage.getItem("user")
      const user = userData ? JSON.parse(userData) : null

      // Create payment order
      const orderResponse = await api.createPaymentOrder({
        feeId: fee.id,
        amount: amount,
        description: `Payment for ${fee.fee_type || 'Fee'} - ${fee.term || ''}`,
      })

      if (!orderResponse || orderResponse.status === 0) {
        throw new Error(orderResponse?.message || "Failed to create payment order")
      }

      const orderData = orderResponse.data

      // Initialize Razorpay checkout
      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100, // Convert to paise
        currency: orderData.currency || "INR",
        order_id: orderData.order_id,
        name: user?.school?.name || "School Management System",
        description: orderResponse.data.description || `Payment for ${fee.fee_type || 'Fee'}`,
        handler: async function (response: any) {
          try {
            setIsLoading(true)
            // Verify payment
            const verifyResponse = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              feeId: fee.id,
            })

            if (verifyResponse && verifyResponse.status === 1) {
              toast.success("Payment successful!")
              if (onSuccess) {
                onSuccess()
              }
            } else {
              throw new Error(verifyResponse?.message || "Payment verification failed")
            }
          } catch (error: any) {
            console.error("Payment verification error:", error)
            toast.error(error.message || "Payment verification failed. Please contact support.")
          } finally {
            setIsLoading(false)
          }
        },
        prefill: {
          name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName || "Student",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#6366f1", // Indigo color
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
            toast.info("Payment cancelled")
          },
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      setIsLoading(false)
    } catch (error: any) {
      console.error("Payment initiation error:", error)
      toast.error(error.message || "Failed to initiate payment. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handlePayment}
      disabled={isLoading || !razorpayLoaded || amount <= 0}
      className="w-full md:w-auto"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Pay ₹{amount.toLocaleString("en-IN")}
        </>
      )}
    </Button>
  )
}

