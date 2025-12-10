# Backend API Development Prompt for New Role Dashboards

Create REST API endpoints for the following roles in the School Management System. Use NestJS with TypeORM and MySQL.

## Response Format Standards

**Success Response:**
```json
{
  "status": 1,
  "message": "Operation successful",
  "data": { ... },
  "result": [ ... ]
}
```

**Error Response:**
```json
{
  "status": 0,
  "message": "Error message",
  "error": "Detailed error information"
}
```

---

## 1. IT ADMIN APIs

### 1.1 Get IT Admin Dashboard Stats
**GET** `/api/it-admin/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalUsers": 1234,
    "activeUsers": 1156,
    "systemStatus": "online",
    "serverUptime": 99.9,
    "activeSessions": 156,
    "storageUsed": 68,
    "storageTotal": 650,
    "storageUsedGB": 450,
    "securityAlerts": 2,
    "securityAlertsPriority": "low",
    "lastBackup": "2024-12-10T10:30:00Z"
  }
}
```

### 1.2 Get All Users
**GET** `/api/it-admin/users`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `role` (optional, filter by role)
  - `search` (optional, search by name/email)
- **Response:**
```json
{
  "status": 1,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "id": 4,
        "name": "Teacher"
      },
      "status": "active",
      "lastLogin": "2024-12-10T08:30:00Z",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 20
}
```

### 1.3 Get System Logs
**GET** `/api/it-admin/logs`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
  - `level` (optional: "info", "warning", "error")
  - `startDate` (optional, format: YYYY-MM-DD)
  - `endDate` (optional, format: YYYY-MM-DD)
- **Response:**
```json
{
  "status": 1,
  "message": "System logs retrieved successfully",
  "data": [
    {
      "id": 1,
      "level": "error",
      "message": "Database connection timeout",
      "timestamp": "2024-12-10T10:30:00Z",
      "userId": 123,
      "action": "login"
    }
  ],
  "total": 5000,
  "page": 1,
  "limit": 50
}
```

### 1.4 Create Database Backup
**POST** `/api/it-admin/backup/create`
- **Request Body:**
```json
{
  "backupType": "full",
  "description": "Daily backup"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Backup created successfully",
  "data": {
    "backupId": 1,
    "backupFile": "backup_2024-12-10_10-30-00.sql",
    "size": "2.5 GB",
    "createdAt": "2024-12-10T10:30:00Z"
  }
}
```

### 1.5 Get Backup List
**GET** `/api/it-admin/backup/list`
- **Response:**
```json
{
  "status": 1,
  "message": "Backups retrieved successfully",
  "data": [
    {
      "id": 1,
      "backupFile": "backup_2024-12-10_10-30-00.sql",
      "size": "2.5 GB",
      "type": "full",
      "createdAt": "2024-12-10T10:30:00Z",
      "status": "completed"
    }
  ]
}
```

---

## 2. ACCOUNTANT APIs

### 2.1 Get Accountant Dashboard Stats
**GET** `/api/accountant/dashboard/stats`
- **Query Parameters:**
  - `month` (optional, format: YYYY-MM, default: current month)
  - `year` (optional, default: current year)
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalRevenue": 245000,
    "pendingPayments": 45000,
    "pendingPaymentsCount": 23,
    "thisMonthRevenue": 185000,
    "thisMonthTransactions": 342,
    "lastMonthRevenue": 217500,
    "revenueChange": 12.5,
    "currency": "INR"
  }
}
```

### 2.2 Get Recent Transactions
**GET** `/api/accountant/transactions/recent`
- **Query Parameters:**
  - `limit` (optional, default: 10)
- **Response:**
```json
{
  "status": 1,
  "message": "Recent transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "transactionId": "TXN-2024-12-10-001",
      "type": "fee_payment",
      "studentId": 1234,
      "studentName": "John Doe",
      "amount": 5000,
      "paymentMethod": "online",
      "status": "completed",
      "createdAt": "2024-12-10T08:30:00Z"
    }
  ]
}
```

### 2.3 Get All Transactions
**GET** `/api/accountant/transactions`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `startDate` (optional, format: YYYY-MM-DD)
  - `endDate` (optional, format: YYYY-MM-DD)
  - `status` (optional: "pending", "completed", "failed")
  - `type` (optional: "fee_payment", "refund", "other")
- **Response:**
```json
{
  "status": 1,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "id": 1,
      "transactionId": "TXN-2024-12-10-001",
      "type": "fee_payment",
      "studentId": 1234,
      "studentName": "John Doe",
      "amount": 5000,
      "paymentMethod": "online",
      "status": "completed",
      "createdAt": "2024-12-10T08:30:00Z"
    }
  ],
  "total": 342,
  "page": 1,
  "limit": 20
}
```

### 2.4 Process Payment
**POST** `/api/accountant/payments/process`
- **Request Body:**
```json
{
  "studentId": 1234,
  "amount": 5000,
  "paymentMethod": "cash",
  "paymentDate": "2024-12-10",
  "description": "Monthly fee payment",
  "receiptNumber": "RCP-2024-001"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Payment processed successfully",
  "data": {
    "transactionId": "TXN-2024-12-10-001",
    "receiptNumber": "RCP-2024-001",
    "amount": 5000,
    "status": "completed"
  }
}
```

### 2.5 Generate Invoice
**POST** `/api/accountant/invoices/generate`
- **Request Body:**
```json
{
  "studentId": 1234,
  "feeType": "monthly",
  "amount": 5000,
  "dueDate": "2024-12-25",
  "description": "Monthly fee for December 2024"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Invoice generated successfully",
  "data": {
    "invoiceId": 1,
    "invoiceNumber": "INV-2024-12-10-001",
    "studentId": 1234,
    "studentName": "John Doe",
    "amount": 5000,
    "dueDate": "2024-12-25",
    "status": "pending",
    "pdfUrl": "/invoices/INV-2024-12-10-001.pdf"
  }
}
```

### 2.6 Get Financial Reports
**GET** `/api/accountant/reports/financial`
- **Query Parameters:**
  - `reportType` (required: "daily", "monthly", "yearly")
  - `startDate` (required for daily, format: YYYY-MM-DD)
  - `endDate` (required for daily, format: YYYY-MM-DD)
  - `month` (required for monthly, format: YYYY-MM)
  - `year` (required for yearly, format: YYYY)
- **Response:**
```json
{
  "status": 1,
  "message": "Financial report generated successfully",
  "data": {
    "period": "2024-12",
    "totalRevenue": 185000,
    "totalExpenses": 120000,
    "netProfit": 65000,
    "transactions": 342,
    "breakdown": {
      "feePayments": 150000,
      "otherIncome": 35000,
      "salaries": 80000,
      "maintenance": 25000,
      "otherExpenses": 15000
    }
  }
}
```

---

## 3. PARENT APIs

### 3.1 Get Parent Dashboard Stats
**GET** `/api/parent/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "childrenCount": 2,
    "averageAttendance": 94,
    "pendingFees": 8500,
    "unreadMessages": 3
  }
}
```

### 3.2 Get Parent's Children
**GET** `/api/parent/children`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
{
  "status": 1,
  "message": "Children retrieved successfully",
  "data": [
    {
      "id": 1234,
      "name": "Sarah Johnson",
      "grade": "10",
      "className": "A",
      "attendance": 95,
      "profilePhoto": "/photos/1234.jpg"
    },
    {
      "id": 1235,
      "name": "Michael Johnson",
      "grade": "8",
      "className": "B",
      "attendance": 92,
      "profilePhoto": "/photos/1235.jpg"
    }
  ]
}
```

### 3.3 Get Child Attendance
**GET** `/api/parent/children/:childId/attendance`
- **Query Parameters:**
  - `month` (optional, format: YYYY-MM, default: current month)
  - `year` (optional, default: current year)
- **Response:**
```json
{
  "status": 1,
  "message": "Attendance retrieved successfully",
  "data": {
    "childId": 1234,
    "childName": "Sarah Johnson",
    "month": "2024-12",
    "totalDays": 20,
    "presentDays": 19,
    "absentDays": 1,
    "attendancePercentage": 95,
    "dailyAttendance": [
      {
        "date": "2024-12-01",
        "status": "present",
        "remarks": ""
      }
    ]
  }
}
```

### 3.4 Get Child Grades
**GET** `/api/parent/children/:childId/grades`
- **Query Parameters:**
  - `examType` (optional: "midterm", "final", "assignment")
  - `subject` (optional)
- **Response:**
```json
{
  "status": 1,
  "message": "Grades retrieved successfully",
  "data": {
    "childId": 1234,
    "childName": "Sarah Johnson",
    "grades": [
      {
        "examId": 1,
        "examName": "Mathematics Mid-Term",
        "subject": "Mathematics",
        "score": 85,
        "totalMarks": 100,
        "percentage": 85,
        "grade": "A",
        "examDate": "2024-12-05"
      }
    ],
    "averageScore": 87.5
  }
}
```

### 3.5 Get Child Fees
**GET** `/api/parent/children/:childId/fees`
- **Response:**
```json
{
  "status": 1,
  "message": "Fees information retrieved successfully",
  "data": {
    "childId": 1234,
    "childName": "Sarah Johnson",
    "pendingFees": 8500,
    "paidFees": 15000,
    "totalFees": 23500,
    "feeDetails": [
      {
        "id": 1,
        "feeType": "Monthly Fee",
        "amount": 5000,
        "dueDate": "2024-12-25",
        "status": "pending",
        "paidDate": null
      }
    ]
  }
}
```

### 3.6 Get Parent Messages
**GET** `/api/parent/messages`
- **Query Parameters:**
  - `unreadOnly` (optional, default: false)
- **Response:**
```json
{
  "status": 1,
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": 1,
      "from": "Teacher",
      "fromName": "Mrs. Smith",
      "subject": "Parent-Teacher Meeting",
      "message": "Please attend the PTM on December 15th",
      "isRead": false,
      "createdAt": "2024-12-10T10:00:00Z"
    }
  ]
}
```

---

## 4. SUPPORT STAFF APIs

### 4.1 Get Support Staff Dashboard Stats
**GET** `/api/support-staff/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "activeRequests": 12,
    "completedToday": 8,
    "totalFacilities": 24,
    "urgentRequests": 3
  }
}
```

### 4.2 Get Maintenance Requests
**GET** `/api/support-staff/maintenance/requests`
- **Query Parameters:**
  - `status` (optional: "pending", "in_progress", "completed", "cancelled")
  - `priority` (optional: "low", "medium", "high", "urgent")
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:**
```json
{
  "status": 1,
  "message": "Maintenance requests retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "AC Repair - Room 101",
      "description": "AC not working properly",
      "facilityId": 5,
      "facilityName": "Room 101",
      "priority": "urgent",
      "status": "pending",
      "requestedBy": "John Doe",
      "requestedAt": "2024-12-10T08:00:00Z",
      "assignedTo": null,
      "completedAt": null
    }
  ],
  "total": 12,
  "page": 1,
  "limit": 20
}
```

### 4.3 Update Maintenance Request Status
**PATCH** `/api/support-staff/maintenance/requests/:requestId/status`
- **Request Body:**
```json
{
  "status": "in_progress",
  "notes": "Started working on AC repair"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Request status updated successfully",
  "data": {
    "id": 1,
    "status": "in_progress",
    "updatedAt": "2024-12-10T10:30:00Z"
  }
}
```

### 4.4 Complete Maintenance Request
**POST** `/api/support-staff/maintenance/requests/:requestId/complete`
- **Request Body:**
```json
{
  "notes": "AC repaired successfully",
  "cost": 500
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Request completed successfully",
  "data": {
    "id": 1,
    "status": "completed",
    "completedAt": "2024-12-10T11:00:00Z"
  }
}
```

### 4.5 Get Facilities List
**GET** `/api/support-staff/facilities`
- **Response:**
```json
{
  "status": 1,
  "message": "Facilities retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "Room 101",
      "type": "classroom",
      "building": "Main Building",
      "floor": 1,
      "status": "available",
      "maintenanceCount": 2
    }
  ]
}
```

---

## 5. LIBRARIAN APIs

### 5.1 Get Librarian Dashboard Stats
**GET** `/api/librarian/dashboard/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "totalBooks": 5234,
    "issuedBooks": 342,
    "overdueBooks": 23,
    "availableBooks": 4869
  }
}
```

### 5.2 Get Books Catalog
**GET** `/api/librarian/books`
- **Query Parameters:**
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
  - `search` (optional, search by title/author/ISBN)
  - `category` (optional)
  - `status` (optional: "available", "issued", "reserved")
- **Response:**
```json
{
  "status": 1,
  "message": "Books retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Mathematics Fundamentals",
      "author": "John Smith",
      "isbn": "978-1234567890",
      "category": "Mathematics",
      "totalCopies": 10,
      "availableCopies": 8,
      "issuedCopies": 2,
      "status": "available"
    }
  ],
  "total": 5234,
  "page": 1,
  "limit": 20
}
```

### 5.3 Issue Book
**POST** `/api/librarian/books/issue`
- **Request Body:**
```json
{
  "bookId": 1,
  "studentId": 1234,
  "issueDate": "2024-12-10",
  "dueDate": "2024-12-24"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Book issued successfully",
  "data": {
    "issueId": 1,
    "bookId": 1,
    "bookTitle": "Mathematics Fundamentals",
    "studentId": 1234,
    "studentName": "John Doe",
    "issueDate": "2024-12-10",
    "dueDate": "2024-12-24",
    "status": "issued"
  }
}
```

### 5.4 Return Book
**POST** `/api/librarian/books/return`
- **Request Body:**
```json
{
  "issueId": 1,
  "returnDate": "2024-12-10"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Book returned successfully",
  "data": {
    "issueId": 1,
    "returnDate": "2024-12-10",
    "fine": 0,
    "status": "returned"
  }
}
```

### 5.5 Get Issued Books
**GET** `/api/librarian/books/issued`
- **Query Parameters:**
  - `studentId` (optional)
  - `status` (optional: "issued", "overdue", "returned")
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:**
```json
{
  "status": 1,
  "message": "Issued books retrieved successfully",
  "data": [
    {
      "id": 1,
      "issueId": 1,
      "bookId": 1,
      "bookTitle": "Mathematics Fundamentals",
      "studentId": 1234,
      "studentName": "John Doe",
      "issueDate": "2024-12-10",
      "dueDate": "2024-12-24",
      "returnDate": null,
      "status": "issued",
      "isOverdue": false
    }
  ],
  "total": 342,
  "page": 1,
  "limit": 20
}
```

### 5.6 Get Library Reports
**GET** `/api/librarian/reports`
- **Query Parameters:**
  - `reportType` (required: "popular_books", "overdue_books", "issue_statistics")
  - `startDate` (optional, format: YYYY-MM-DD)
  - `endDate` (optional, format: YYYY-MM-DD)
- **Response:**
```json
{
  "status": 1,
  "message": "Report generated successfully",
  "data": {
    "reportType": "issue_statistics",
    "period": "2024-12",
    "totalIssues": 150,
    "totalReturns": 142,
    "overdueCount": 8,
    "popularBooks": [
      {
        "bookId": 1,
        "bookTitle": "Mathematics Fundamentals",
        "issueCount": 25
      }
    ]
  }
}
```

---

## 6. NURSE/MEDICAL APIs

### 6.1 Get Nurse Dashboard Stats
**GET** `/api/nurse/dashboard/stats`
- **Query Parameters:**
  - `date` (optional, format: YYYY-MM-DD, default: today)
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "todayAppointments": 8,
    "totalHealthRecords": 1234,
    "activeMedications": 45,
    "urgentCases": 2
  }
}
```

### 6.2 Get Today's Appointments
**GET** `/api/nurse/appointments/today`
- **Query Parameters:**
  - `date` (optional, format: YYYY-MM-DD, default: today)
- **Response:**
```json
{
  "status": 1,
  "message": "Appointments retrieved successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1234,
      "studentName": "John Doe",
      "appointmentType": "health_check",
      "scheduledTime": "2024-12-10T10:00:00Z",
      "status": "completed",
      "notes": "Regular health checkup"
    }
  ]
}
```

### 6.3 Get Student Health Records
**GET** `/api/nurse/health-records`
- **Query Parameters:**
  - `studentId` (optional)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:**
```json
{
  "status": 1,
  "message": "Health records retrieved successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1234,
      "studentName": "John Doe",
      "recordType": "checkup",
      "date": "2024-12-10",
      "temperature": 98.6,
      "bloodPressure": "120/80",
      "notes": "Normal health checkup",
      "recordedBy": "Nurse Smith",
      "createdAt": "2024-12-10T10:00:00Z"
    }
  ],
  "total": 1234,
  "page": 1,
  "limit": 20
}
```

### 6.4 Add Health Record
**POST** `/api/nurse/health-records`
- **Request Body:**
```json
{
  "studentId": 1234,
  "recordType": "checkup",
  "date": "2024-12-10",
  "temperature": 98.6,
  "bloodPressure": "120/80",
  "weight": 50,
  "height": 150,
  "notes": "Regular health checkup",
  "symptoms": [],
  "diagnosis": "Healthy"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Health record added successfully",
  "data": {
    "id": 1,
    "studentId": 1234,
    "recordType": "checkup",
    "date": "2024-12-10",
    "createdAt": "2024-12-10T10:00:00Z"
  }
}
```

### 6.5 Schedule Appointment
**POST** `/api/nurse/appointments`
- **Request Body:**
```json
{
  "studentId": 1234,
  "appointmentType": "health_check",
  "scheduledDate": "2024-12-15",
  "scheduledTime": "10:00",
  "reason": "Regular checkup",
  "priority": "normal"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Appointment scheduled successfully",
  "data": {
    "id": 1,
    "studentId": 1234,
    "studentName": "John Doe",
    "appointmentType": "health_check",
    "scheduledTime": "2024-12-15T10:00:00Z",
    "status": "scheduled"
  }
}
```

### 6.6 Get Active Medications
**GET** `/api/nurse/medications/active`
- **Query Parameters:**
  - `studentId` (optional)
- **Response:**
```json
{
  "status": 1,
  "message": "Active medications retrieved successfully",
  "data": [
    {
      "id": 1,
      "studentId": 1234,
      "studentName": "John Doe",
      "medicationName": "Paracetamol",
      "dosage": "500mg",
      "frequency": "twice daily",
      "startDate": "2024-12-01",
      "endDate": "2024-12-15",
      "prescribedBy": "Dr. Smith",
      "status": "active"
    }
  ]
}
```

### 6.7 Generate Health Report
**GET** `/api/nurse/reports/health`
- **Query Parameters:**
  - `studentId` (required)
  - `startDate` (optional, format: YYYY-MM-DD)
  - `endDate` (optional, format: YYYY-MM-DD)
- **Response:**
```json
{
  "status": 1,
  "message": "Health report generated successfully",
  "data": {
    "studentId": 1234,
    "studentName": "John Doe",
    "period": "2024-12",
    "totalVisits": 5,
    "averageTemperature": 98.6,
    "medications": 2,
    "healthRecords": [
      {
        "date": "2024-12-10",
        "type": "checkup",
        "notes": "Regular health checkup"
      }
    ],
    "pdfUrl": "/reports/health/1234_2024-12.pdf"
  }
}
```

---

## 7. SECURITY APIs

### 7.1 Get Security Dashboard Stats
**GET** `/api/security/dashboard/stats`
- **Query Parameters:**
  - `date` (optional, format: YYYY-MM-DD, default: today)
- **Response:**
```json
{
  "status": 1,
  "message": "Dashboard stats retrieved successfully",
  "data": {
    "todayVisitors": 24,
    "activeVisitors": 8,
    "monthlyIncidents": 1,
    "todayEntryLogs": 156
  }
}
```

### 7.2 Register Visitor
**POST** `/api/security/visitors/register`
- **Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+91 90000 00000",
  "email": "john@example.com",
  "purpose": "parent_meeting",
  "visitingPerson": "Student ID: 1234",
  "expectedDuration": 60,
  "idProof": "Aadhaar",
  "idProofNumber": "1234 5678 9012"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Visitor registered successfully",
  "data": {
    "id": 1,
    "name": "John Smith",
    "phone": "+91 90000 00000",
    "purpose": "parent_meeting",
    "checkInTime": "2024-12-10T10:00:00Z",
    "status": "checked_in",
    "visitorBadge": "VB-2024-12-10-001"
  }
}
```

### 7.3 Check Out Visitor
**POST** `/api/security/visitors/:visitorId/checkout`
- **Request Body:**
```json
{
  "notes": "Visit completed successfully"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Visitor checked out successfully",
  "data": {
    "id": 1,
    "checkInTime": "2024-12-10T10:00:00Z",
    "checkOutTime": "2024-12-10T11:30:00Z",
    "duration": 90,
    "status": "checked_out"
  }
}
```

### 7.4 Get Visitors List
**GET** `/api/security/visitors`
- **Query Parameters:**
  - `status` (optional: "checked_in", "checked_out")
  - `date` (optional, format: YYYY-MM-DD)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:**
```json
{
  "status": 1,
  "message": "Visitors retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "John Smith",
      "phone": "+91 90000 00000",
      "purpose": "parent_meeting",
      "visitingPerson": "Student ID: 1234",
      "checkInTime": "2024-12-10T10:00:00Z",
      "checkOutTime": null,
      "status": "checked_in",
      "visitorBadge": "VB-2024-12-10-001"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 20
}
```

### 7.5 Get Entry/Exit Logs
**GET** `/api/security/logs`
- **Query Parameters:**
  - `date` (optional, format: YYYY-MM-DD, default: today)
  - `type` (optional: "entry", "exit", "both")
  - `page` (optional, default: 1)
  - `limit` (optional, default: 50)
- **Response:**
```json
{
  "status": 1,
  "message": "Entry/exit logs retrieved successfully",
  "data": [
    {
      "id": 1,
      "personType": "student",
      "personId": 1234,
      "personName": "John Doe",
      "type": "entry",
      "timestamp": "2024-12-10T08:00:00Z",
      "gate": "Main Gate",
      "verifiedBy": "Security Guard 1"
    }
  ],
  "total": 156,
  "page": 1,
  "limit": 50
}
```

### 7.6 Report Incident
**POST** `/api/security/incidents`
- **Request Body:**
```json
{
  "type": "unauthorized_entry",
  "severity": "medium",
  "description": "Unauthorized person tried to enter",
  "location": "Main Gate",
  "reportedBy": "Security Guard 1",
  "incidentDate": "2024-12-10",
  "incidentTime": "14:30"
}
```
- **Response:**
```json
{
  "status": 1,
  "message": "Incident reported successfully",
  "data": {
    "id": 1,
    "incidentNumber": "INC-2024-12-10-001",
    "type": "unauthorized_entry",
    "severity": "medium",
    "status": "reported",
    "reportedAt": "2024-12-10T14:30:00Z"
  }
}
```

### 7.7 Get Incidents
**GET** `/api/security/incidents`
- **Query Parameters:**
  - `status` (optional: "reported", "investigating", "resolved")
  - `severity` (optional: "low", "medium", "high", "critical")
  - `startDate` (optional, format: YYYY-MM-DD)
  - `endDate` (optional, format: YYYY-MM-DD)
  - `page` (optional, default: 1)
  - `limit` (optional, default: 20)
- **Response:**
```json
{
  "status": 1,
  "message": "Incidents retrieved successfully",
  "data": [
    {
      "id": 1,
      "incidentNumber": "INC-2024-12-10-001",
      "type": "unauthorized_entry",
      "severity": "medium",
      "description": "Unauthorized person tried to enter",
      "location": "Main Gate",
      "status": "reported",
      "reportedAt": "2024-12-10T14:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 20
}
```

---

## Authentication & Authorization

All endpoints require:
- **Authentication:** JWT Bearer token in Authorization header
- **Authorization:** Role-based access control
  - IT Admin: Full system access
  - Accountant: Financial data access
  - Parent: Only their children's data
  - Support Staff: Maintenance and facilities
  - Librarian: Library management
  - Nurse: Health records (with privacy restrictions)
  - Security: Visitor and incident management

## Error Handling

All endpoints should return proper HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Database Considerations

1. **Foreign Keys:** Ensure proper relationships between tables
2. **Indexes:** Add indexes on frequently queried fields (studentId, date, status, etc.)
3. **Soft Deletes:** Consider soft deletes for important records
4. **Audit Logs:** Track changes to sensitive data
5. **Data Privacy:** Implement proper access controls for student/parent data

## Notes

- All dates should be in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
- All monetary values should be in the smallest currency unit (paise for INR)
- Pagination should be consistent across all list endpoints
- Search functionality should support partial matches
- Reports should be generated asynchronously for large datasets
- File uploads (PDFs, images) should be stored securely with proper access controls

