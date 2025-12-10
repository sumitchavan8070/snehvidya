# API Development Prompt for Backend Team

## Task
Create REST API endpoints for 7 new roles in the School Management System using NestJS with TypeORM and MySQL.

## Response Format
All endpoints must return:
```json
{
  "status": 1,  // 1 for success, 0 for error
  "message": "Operation message",
  "data": { ... } or "result": [ ... ]
}
```

## Required APIs by Role

### 1. IT ADMIN
- `GET /api/it-admin/dashboard/stats` - Return: totalUsers, activeUsers, systemStatus, serverUptime, activeSessions, storageUsed, storageTotal, securityAlerts, lastBackup
- `GET /api/it-admin/users` - List all users with pagination, search, role filter
- `GET /api/it-admin/logs` - System logs with pagination, level filter, date range
- `POST /api/it-admin/backup/create` - Create database backup, return backupId, backupFile, size, createdAt
- `GET /api/it-admin/backup/list` - List all backups with status

### 2. ACCOUNTANT
- `GET /api/accountant/dashboard/stats` - Return: totalRevenue, pendingPayments, pendingPaymentsCount, thisMonthRevenue, thisMonthTransactions, revenueChange
- `GET /api/accountant/transactions/recent?limit=10` - Recent transactions with student info
- `GET /api/accountant/transactions` - All transactions with pagination, date range, status, type filters
- `POST /api/accountant/payments/process` - Process payment: studentId, amount, paymentMethod, paymentDate, description, receiptNumber
- `POST /api/accountant/invoices/generate` - Generate invoice: studentId, feeType, amount, dueDate, description
- `GET /api/accountant/reports/financial` - Financial reports: reportType (daily/monthly/yearly), date range, return revenue, expenses, netProfit, breakdown

### 3. PARENT
- `GET /api/parent/dashboard/stats` - Return: childrenCount, averageAttendance, pendingFees, unreadMessages
- `GET /api/parent/children` - List parent's children with attendance percentage
- `GET /api/parent/children/:childId/attendance?month=YYYY-MM` - Child attendance with daily records
- `GET /api/parent/children/:childId/grades?examType=&subject=` - Child grades/exam results
- `GET /api/parent/children/:childId/fees` - Child fees: pendingFees, paidFees, feeDetails with status
- `GET /api/parent/messages?unreadOnly=false` - Parent messages from teachers/staff

### 4. SUPPORT STAFF
- `GET /api/support-staff/dashboard/stats` - Return: activeRequests, completedToday, totalFacilities, urgentRequests
- `GET /api/support-staff/maintenance/requests` - List requests with status, priority, pagination filters
- `PATCH /api/support-staff/maintenance/requests/:requestId/status` - Update status: status, notes
- `POST /api/support-staff/maintenance/requests/:requestId/complete` - Complete request: notes, cost
- `GET /api/support-staff/facilities` - List all facilities with status and maintenance count

### 5. LIBRARIAN
- `GET /api/librarian/dashboard/stats` - Return: totalBooks, issuedBooks, overdueBooks, availableBooks
- `GET /api/librarian/books` - Books catalog with pagination, search (title/author/ISBN), category, status filters
- `POST /api/librarian/books/issue` - Issue book: bookId, studentId, issueDate, dueDate
- `POST /api/librarian/books/return` - Return book: issueId, returnDate, calculate fine if overdue
- `GET /api/librarian/books/issued` - Issued books with studentId, status, overdue filters
- `GET /api/librarian/reports` - Reports: reportType (popular_books/overdue_books/issue_statistics), date range

### 6. NURSE/MEDICAL
- `GET /api/nurse/dashboard/stats?date=YYYY-MM-DD` - Return: todayAppointments, totalHealthRecords, activeMedications, urgentCases
- `GET /api/nurse/appointments/today?date=YYYY-MM-DD` - Today's appointments with student info
- `GET /api/nurse/health-records` - Health records with studentId filter, pagination
- `POST /api/nurse/health-records` - Add record: studentId, recordType, date, temperature, bloodPressure, weight, height, notes, symptoms, diagnosis
- `POST /api/nurse/appointments` - Schedule appointment: studentId, appointmentType, scheduledDate, scheduledTime, reason, priority
- `GET /api/nurse/medications/active?studentId=` - Active medications with dosage, frequency, dates
- `GET /api/nurse/reports/health?studentId=&startDate=&endDate=` - Generate health report PDF

### 7. SECURITY
- `GET /api/security/dashboard/stats?date=YYYY-MM-DD` - Return: todayVisitors, activeVisitors, monthlyIncidents, todayEntryLogs
- `POST /api/security/visitors/register` - Register visitor: name, phone, email, purpose, visitingPerson, expectedDuration, idProof, idProofNumber
- `POST /api/security/visitors/:visitorId/checkout` - Checkout visitor: notes, calculate duration
- `GET /api/security/visitors` - Visitors list with status, date, pagination filters
- `GET /api/security/logs?date=&type=entry/exit/both` - Entry/exit logs with personType, personId, timestamp, gate
- `POST /api/security/incidents` - Report incident: type, severity, description, location, reportedBy, incidentDate, incidentTime
- `GET /api/security/incidents` - Incidents list with status, severity, date range filters

## Authentication & Authorization
- All endpoints require JWT Bearer token in Authorization header
- Implement role-based access control:
  - IT Admin: Full system access
  - Accountant: Financial data only
  - Parent: Only their children's data (validate parent-child relationship)
  - Support Staff: Maintenance and facilities
  - Librarian: Library management
  - Nurse: Health records (respect privacy)
  - Security: Visitor and incident management

## Database Requirements
1. Create tables for:
   - Maintenance requests (support_staff)
   - Facilities (support_staff)
   - Books, book issues, returns (librarian)
   - Health records, appointments, medications (nurse)
   - Visitors, entry/exit logs, incidents (security)
   - Parent-child relationships (parent)
   - Transactions, invoices (accountant)
   - System logs, backups (it_admin)

2. Add proper foreign keys and indexes
3. Use soft deletes for important records
4. Implement audit logging for sensitive operations

## Error Handling
- Return HTTP 200 with status: 0 for business logic errors
- Return HTTP 400 for validation errors
- Return HTTP 401 for unauthorized
- Return HTTP 403 for forbidden
- Return HTTP 404 for not found
- Return HTTP 500 for server errors

## Additional Notes
- All dates in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ)
- Monetary values in smallest currency unit (paise for INR)
- Implement pagination for all list endpoints (page, limit)
- Support search with partial matching
- Generate reports asynchronously for large datasets
- Store file uploads (PDFs, images) securely with access controls
- Validate all input data (required fields, data types, enums)
- Use database transactions for multi-step operations
- Calculate fines/charges automatically (overdue books, etc.)

## Priority
Implement in this order:
1. Dashboard stats endpoints (all roles)
2. CRUD operations for each role's main entities
3. Report generation endpoints
4. File upload/download functionality

