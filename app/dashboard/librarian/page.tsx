"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, List, CheckCircle, FileText, Clock, AlertCircle, Loader2 } from "lucide-react"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

export default function LibrarianDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [issuedBooks, setIssuedBooks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, issuedRes] = await Promise.all([
        api.getLibrarianDashboardStats(),
        api.getIssuedBooks({ limit: 5 })
      ])

      if (statsRes.status === 1) {
        setStats(statsRes.data)
      }

      if (issuedRes.status === 1) {
        setIssuedBooks(issuedRes.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch {
      return "N/A"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Librarian Dashboard</h2>
        <p className="text-muted-foreground">Manage library resources and book circulation</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBooks?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">In catalog</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issued Books</CardTitle>
            <List className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.issuedBooks || 0}</div>
            <p className="text-xs text-muted-foreground">Currently issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.overdueBooks || 0}</div>
            <p className="text-xs text-muted-foreground">Books overdue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.availableBooks?.toLocaleString() || "0"}</div>
            <p className="text-xs text-muted-foreground">Books available</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Issues</CardTitle>
            <CardDescription>Latest book issues</CardDescription>
          </CardHeader>
          <CardContent>
            {issuedBooks.length > 0 ? (
              <div className="space-y-4">
                {issuedBooks.map((issue: any) => (
                  <div key={issue.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{issue.bookTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {issue.studentName ? `${issue.studentName} (ID: ${issue.studentId})` : `Student ID: ${issue.studentId}`} • 
                        {issue.issueDate ? ` Issued ${formatDate(issue.issueDate)}` : " Issued today"}
                      </p>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No recent issues</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common library tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">Issue Book</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Return Book</span>
              </div>
            </div>
            <div className="p-3 border rounded-lg hover:bg-accent cursor-pointer">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4" />
                <span className="font-medium">View Reports</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
