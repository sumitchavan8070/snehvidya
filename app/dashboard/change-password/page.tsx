"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotStep, setForgotStep] = useState<"email" | "otp" | "reset" | "complete">("email")
  const [forgotEmail, setForgotEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [forgotNewPassword, setForgotNewPassword] = useState("")
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("")
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await api.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      const isSuccess = response?.status === 1 || response?.success === true

      if (!isSuccess) {
        const message = response?.message || "Unable to update password. Try again later."
        toast.error(message)
        return
      }

      toast.success(response?.message || "Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Failed to update password:", error)
      const message = error instanceof Error ? error.message : "Unable to update password. Try again later."
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const forgotSteps = useMemo(
    () => [
      { id: "email", label: "Verify Email" },
      { id: "otp", label: "Enter OTP" },
      { id: "reset", label: "Set Password" },
      { id: "complete", label: "Done" },
    ],
    []
  )

  const currentStepIndex = forgotSteps.findIndex((step) => step.id === forgotStep)

  const handleForgotEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsForgotSubmitting(true)
    try {
      // TODO: Replace with API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success(`OTP sent to ${forgotEmail}`)
      setForgotStep("otp")
    } catch (error) {
      console.error("Failed to send OTP:", error)
      toast.error("Unable to send OTP, try again.")
    } finally {
      setIsForgotSubmitting(false)
    }
  }

  const handleOtpSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (otp.length < 4) {
      toast.error("Please enter a valid OTP")
      return
    }
    setIsForgotSubmitting(true)
    try {
      // TODO: Replace with API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("OTP verified")
      setForgotStep("reset")
    } catch (error) {
      console.error("Failed to verify OTP:", error)
      toast.error("Invalid or expired OTP.")
    } finally {
      setIsForgotSubmitting(false)
    }
  }

  const handleForgotResetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (forgotNewPassword !== forgotConfirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (forgotNewPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setIsForgotSubmitting(true)
    try {
      // TODO: Replace with API call to set new password
      await new Promise((resolve) => setTimeout(resolve, 600))
      toast.success("Password reset successfully")
      setForgotStep("complete")
      setForgotNewPassword("")
      setForgotConfirmPassword("")
      setOtp("")
    } catch (error) {
      console.error("Failed to reset password:", error)
      toast.error("Unable to reset password. Try again later.")
    } finally {
      setIsForgotSubmitting(false)
    }
  }

  const resetForgotFlow = () => {
    setForgotStep("email")
    setForgotEmail("")
    setOtp("")
    setForgotNewPassword("")
    setForgotConfirmPassword("")
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-10 px-4">
      <div className="grid gap-6 ">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">Change Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your account password. Make sure it is unique and secure.
            </p>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  minLength={8}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use at least 8 characters, including a number and a symbol for stronger security.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </form>
            <div className="mt-6 rounded-lg border border-dashed border-gray-200 p-4 text-sm text-muted-foreground dark:border-gray-800">
              <p className="font-medium text-gray-700 dark:text-gray-200">Password tips</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                <li>Avoid reusing passwords from other services.</li>
                <li>Consider using a password manager to store complex passwords.</li>
                <li>Change your password regularly to keep your account secure.</li>
              </ul>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}


// for the  forgot password  
{/* 
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold">Forgot Password</CardTitle>
              <Badge variant="outline">OTP Verification</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Recover your account by verifying your email with a one-time password.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-muted-foreground">
              {forgotSteps.map((step, index) => (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      index <= currentStepIndex ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="text-[11px] font-medium">{step.label}</span>
                </div>
              ))}
            </div>

            {forgotStep === "email" && (
              <form className="space-y-4" onSubmit={handleForgotEmailSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Registered Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(event) => setForgotEmail(event.target.value)}
                    placeholder="name@school.edu"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            )}

            {forgotStep === "otp" && (
              <form className="space-y-4" onSubmit={handleOtpSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="6-digit code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Verifying..." : "Verify OTP"}
                </Button>
                <Button type="button" variant="ghost" className="w-full text-sm" onClick={resetForgotFlow}>
                  Resend OTP
                </Button>
              </form>
            )}

            {forgotStep === "reset" && (
              <form className="space-y-4" onSubmit={handleForgotResetSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="forgot-new-password">New Password</Label>
                  <Input
                    id="forgot-new-password"
                    type="password"
                    value={forgotNewPassword}
                    onChange={(event) => setForgotNewPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-confirm-password">Confirm Password</Label>
                  <Input
                    id="forgot-confirm-password"
                    type="password"
                    value={forgotConfirmPassword}
                    onChange={(event) => setForgotConfirmPassword(event.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isForgotSubmitting}>
                  {isForgotSubmitting ? "Updating..." : "Reset Password"}
                </Button>
              </form>
            )}

            {forgotStep === "complete" && (
              <div className="space-y-4 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                  ✓
                </div>
                <h3 className="text-lg font-semibold">Password reset successful</h3>
                <p className="text-sm text-muted-foreground">
                  Your password has been updated. You can now sign in with your new credentials.
                </p>
                <Button className="w-full" onClick={resetForgotFlow}>
                  Go Back
                </Button>
              </div>
            )}
          </CardContent>
        </Card> */}