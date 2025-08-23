"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { School, Bell, Shield, Upload, Save, RefreshCw } from "lucide-react"
import DashboardLayout from "@/dashboard-layout" 

export default function SchoolSettings() {
  const [schoolData, setSchoolData] = useState({
    name: "Greenwood High School",
    address: "123 Education Street, Learning City, LC 12345",
    phone: "+1 (555) 123-4567",
    email: "info@greenwoodhigh.edu",
    website: "www.greenwoodhigh.edu",
    establishedYear: "1985",
    principalName: "Dr. John Smith",
    logoUrl: "/placeholder.svg?height=100&width=100&text=School+Logo",
  })

  const [academicSettings, setAcademicSettings] = useState({
    currentYear: "2023-2024",
    termSystem: "semester",
    gradingScale: "letter",
    attendanceThreshold: "75",
    maxClassSize: "35",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    parentNotifications: true,
    staffNotifications: true,
    attendanceAlerts: true,
    feeReminders: true,
  })

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log("Saving settings...")
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Settings</h1>
            <p className="text-muted-foreground">Manage your school's configuration and preferences</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5" />
                  School Information
                </CardTitle>
                <CardDescription>Basic information about your school</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="space-y-2">
                    <Label>School Logo</Label>
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={schoolData.logoUrl || "/placeholder.svg"} />
                      <AvatarFallback>
                        <School className="h-8 w-8" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">Recommended: 200x200px, PNG or JPG</p>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={schoolData.name}
                      onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="establishedYear">Established Year</Label>
                    <Input
                      id="establishedYear"
                      value={schoolData.establishedYear}
                      onChange={(e) => setSchoolData({ ...schoolData, establishedYear: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={schoolData.address}
                    onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={schoolData.phone}
                      onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={schoolData.email}
                      onChange={(e) => setSchoolData({ ...schoolData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={schoolData.website}
                      onChange={(e) => setSchoolData({ ...schoolData, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="principal">Principal Name</Label>
                    <Input
                      id="principal"
                      value={schoolData.principalName}
                      onChange={(e) => setSchoolData({ ...schoolData, principalName: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="academic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Academic Configuration</CardTitle>
                <CardDescription>Configure academic year, grading, and class settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currentYear">Current Academic Year</Label>
                    <Input
                      id="currentYear"
                      value={academicSettings.currentYear}
                      onChange={(e) => setAcademicSettings({ ...academicSettings, currentYear: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="termSystem">Term System</Label>
                    <Select
                      value={academicSettings.termSystem}
                      onValueChange={(value: any) => setAcademicSettings({ ...academicSettings, termSystem: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semester">Semester System</SelectItem>
                        <SelectItem value="trimester">Trimester System</SelectItem>
                        <SelectItem value="quarter">Quarter System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gradingScale">Grading Scale</Label>
                    <Select
                      value={academicSettings.gradingScale}
                      onValueChange={(value: any) => setAcademicSettings({ ...academicSettings, gradingScale: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                        <SelectItem value="percentage">Percentage (0-100)</SelectItem>
                        <SelectItem value="gpa">GPA Scale (0-4.0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="attendanceThreshold">Minimum Attendance (%)</Label>
                    <Input
                      id="attendanceThreshold"
                      type="number"
                      value={academicSettings.attendanceThreshold}
                      onChange={(e) =>
                        setAcademicSettings({ ...academicSettings, attendanceThreshold: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxClassSize">Maximum Class Size</Label>
                  <Input
                    id="maxClassSize"
                    type="number"
                    value={academicSettings.maxClassSize}
                    onChange={(e) => setAcademicSettings({ ...academicSettings, maxClassSize: e.target.value })}
                    className="w-full md:w-1/2"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how and when notifications are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, emailNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications via SMS</p>
                    </div>
                    <Switch
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, smsNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Parent Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to parents</p>
                    </div>
                    <Switch
                      checked={notificationSettings.parentNotifications}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, parentNotifications: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Staff Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to staff members</p>
                    </div>
                    <Switch
                      checked={notificationSettings.staffNotifications}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, staffNotifications: checked })
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Attendance Alerts</Label>
                      <p className="text-sm text-muted-foreground">Alert when attendance falls below threshold</p>
                    </div>
                    <Switch
                      checked={notificationSettings.attendanceAlerts}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, attendanceAlerts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Fee Reminders</Label>
                      <p className="text-sm text-muted-foreground">Send reminders for pending fee payments</p>
                    </div>
                    <Switch
                      checked={notificationSettings.feeReminders}
                      onCheckedChange={(checked: any) =>
                        setNotificationSettings({ ...notificationSettings, feeReminders: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage security and access control settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Password Policy</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Minimum password length: 8 characters</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require uppercase letters</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require numbers</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Require special characters</Label>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Session Management</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Auto-logout after inactivity</Label>
                        <Switch defaultChecked />
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Session timeout (minutes)</Label>
                          <Input id="sessionTimeout" type="number" defaultValue="30" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Access Control</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Two-factor authentication</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>IP address restrictions</Label>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Login attempt limits</Label>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    <Button variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset All Settings
                    </Button>
                    <Button variant="outline">Export Configuration</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
