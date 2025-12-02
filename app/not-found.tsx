"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-b from-gray-50 to-white px-4 text-center dark:from-slate-900 dark:to-slate-950">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">404 error</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Page not found</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Sorry, we couldn’t find the page you’re looking for. Try returning to the dashboard or using the navigation menu.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/">Go to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}



