# Accountant Fees Management - API Documentation

This document describes the API endpoints required for the Accountant Fees Management page that displays all school students with their fees grouped by student.

## Base URL
```
/api/accountant
```

## Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

## Response Format
All endpoints should return responses in the following format:
```json
{
  "status": 1,  // 1 for success, 0 for error
  "message": "Success message or error description",
  "data": { ... }  // Response data
}
```

---

## 1. Get All Students with Fees API

### GET `/accountant/students/fees`

Get all students in the school with their associated fees grouped by student. This is the primary endpoint for the Fees Management page.

**Query Parameters:**
- `class` (optional, string): Filter by class name (e.g., "10th A")
- `status` (optional, string): Filter by overall payment status ("pending", "paid", "partial")
- `search` (optional, string): Search by student name or student code

**Response:**
```json
{
  "status": 1,
  "message": "Students with fees retrieved successfully",
  "data": [
    {
      "student_id": 123,
      "student_name": "John Doe",
      "student_code": "STU001",
      "class_name": "10th A",
      "roll_number": 15,
      "id": 1,
      "fee_id": 1,
      "fee_type": "Tuition Fee",
      "amount": 5000,
      "paid": 2000,
      "pending": 3000,
      "status": "partial",
      "due_date": "2024-02-15",
      "term": "Q1",
      "description": "Q1 Tuition Fee"
    },
    {
      "student_id": 123,
      "student_name": "John Doe",
      "student_code": "STU001",
      "class_name": "10th A",
      "roll_number": 15,
      "id": 2,
      "fee_id": 2,
      "fee_type": "Annual Fee",
      "amount": 3000,
      "paid": 0,
      "pending": 3000,
      "status": "pending",
      "due_date": "2024-03-01",
      "term": "Q1",
      "description": "Annual Fee"
    },
    {
      "student_id": 124,
      "student_name": "Jane Smith",
      "student_code": "STU002",
      "class_name": "10th B",
      "roll_number": 20,
      "id": 3,
      "fee_id": 3,
      "fee_type": "Tuition Fee",
      "amount": 5000,
      "paid": 5000,
      "pending": 0,
      "status": "paid",
      "due_date": "2024-02-15",
      "term": "Q1",
      "description": "Q1 Tuition Fee"
    }
  ]
}
```

**Notes:**
- The response returns a flat array where each item represents one fee record with student information
- Multiple fees for the same student will appear as separate items in the array
- The frontend groups these by `student_id` to create one card per student
- If a student has no fees, they should still appear in the response with empty fee data (or use alternative endpoint)

**Alternative Response Structure (if backend can group):**
```json
{
  "status": 1,
  "message": "Students with fees retrieved successfully",
  "data": [
    {
      "studentId": 123,
      "studentName": "John Doe",
      "studentCode": "STU001",
      "className": "10th A",
      "rollNumber": 15,
      "totalFees": 8000,
      "totalPaid": 2000,
      "totalPending": 6000,
      "overallStatus": "partial",
      "fees": [
        {
          "id": 1,
          "feeType": "Tuition Fee",
          "amount": 5000,
          "paid": 2000,
          "pending": 3000,
          "status": "partial",
          "dueDate": "2024-02-15",
          "term": "Q1",
          "description": "Q1 Tuition Fee"
        },
        {
          "id": 2,
          "feeType": "Annual Fee",
          "amount": 3000,
          "paid": 0,
          "pending": 3000,
          "status": "pending",
          "dueDate": "2024-03-01",
          "term": "Q1",
          "description": "Annual Fee"
        }
      ]
    }
  ]
}
```

---

## 2. Get All Students API (Fallback)

### GET `/users`

Get all students in the school. Used as fallback if the primary endpoint is not available.

**Query Parameters:**
- `role` (required, string): Should be "student"
- `page` (optional, number): Page number for pagination
- `limit` (optional, number): Items per page

**Response:**
```json
{
  "status": 1,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 123,
      "firstName": "John",
      "lastName": "Doe",
      "studentCode": "STU001",
      "code": "STU001",
      "className": "10th A",
      "class_name": "10th A",
      "rollNumber": 15,
      "roll_number": 15,
      "email": "john.doe@example.com",
      "phone": "1234567890"
    }
  ]
}
```

---

## 3. Get Pending Fees API (Fallback)

### GET `/fees/pending`

Get all pending fees. Used as fallback to combine with students list.

**Response:**
```json
{
  "status": 1,
  "message": "Pending fees retrieved successfully",
  "data": [
    {
      "id": 1,
      "student_id": 123,
      "studentId": 123,
      "student_name": "John Doe",
      "studentName": "John Doe",
      "student_code": "STU001",
      "studentCode": "STU001",
      "class_name": "10th A",
      "className": "10th A",
      "fee_type": "Tuition Fee",
      "feeType": "Tuition Fee",
      "amount": 5000,
      "paid": 2000,
      "pending": 3000,
      "status": "partial",
      "due_date": "2024-02-15",
      "dueDate": "2024-02-15",
      "term": "Q1",
      "description": "Q1 Tuition Fee"
    }
  ]
}
```

---

## 4. Create Fee API

### POST `/student-fees`

Create a new fee for a student.

**Request Body:**
```json
{
  "school_id": 1,
  "student_id": 123,
  "fee_type": "Tuition Fee",
  "amount": 5000,
  "due_date": "2024-02-15",
  "status": "pending",
  "term": "Q1"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Fee created successfully",
  "data": {
    "id": 1,
    "school_id": 1,
    "student_id": 123,
    "fee_type": "Tuition Fee",
    "amount": 5000,
    "due_date": "2024-02-15",
    "status": "pending",
    "term": "Q1",
    "paid": 0,
    "pending": 5000,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 5. Update Fee API

### PATCH `/accountant/fees/{feeId}`

Update fee status or details.

**Request Body:**
```json
{
  "status": "paid",  // Optional: "pending", "paid", "partial"
  "amount": 5000,     // Optional: Update fee amount
  "dueDate": "2024-02-15"  // Optional: Update due date
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Fee updated successfully",
  "data": {
    "id": 1,
    "student_id": 123,
    "fee_type": "Tuition Fee",
    "amount": 5000,
    "paid": 5000,
    "pending": 0,
    "status": "paid",
    "due_date": "2024-02-15",
    "term": "Q1",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## Data Structure Requirements

### Student Object
- `studentId` / `student_id` (number, required): Unique student identifier
- `studentName` / `student_name` (string, required): Full name of the student
- `studentCode` / `student_code` (string, required): Unique student code
- `className` / `class_name` (string, required): Class name (e.g., "10th A")
- `rollNumber` / `roll_number` (number, optional): Roll number in class

### Fee Object
- `id` / `fee_id` (number, required): Unique fee identifier
- `feeType` / `fee_type` (string, required): Type of fee (e.g., "Tuition Fee", "Annual Fee")
- `amount` (number, required): Total fee amount
- `paid` (number, required): Amount paid (default: 0)
- `pending` (number, required): Amount pending (calculated as amount - paid)
- `status` (string, required): Payment status ("pending", "paid", "partial")
- `dueDate` / `due_date` (string, required): Due date in format "YYYY-MM-DD"
- `term` (string, optional): Term identifier (e.g., "Q1", "Q2", "Q3", "Q4")
- `description` (string, optional): Additional description or notes

---

## Frontend Grouping Logic

The frontend groups fees by student using the following logic:

1. **Primary Endpoint**: If `/accountant/students/fees` returns data, group by `student_id`
2. **Fallback**: If primary endpoint fails, use `/users?role=student` and `/fees/pending`, then:
   - Create a map of students by ID
   - Add fees to each student
   - Calculate totals (totalFees, totalPaid, totalPending)
   - Determine overall status:
     - `paid`: totalPending === 0 && fees.length > 0
     - `pending`: totalPaid === 0 && fees.length > 0
     - `partial`: totalPaid > 0 && totalPending > 0

---

## Error Responses

All endpoints should return error responses in the following format:

```json
{
  "status": 0,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

**Common HTTP Status Codes:**
- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Implementation Notes

1. **Performance**: 
   - The primary endpoint should be optimized to return all students with their fees in a single query
   - Consider using JOIN queries to fetch student and fee data together
   - Implement pagination if the number of students is very large

2. **Data Consistency**:
   - Ensure `pending` is always calculated as `amount - paid`
   - Ensure `status` is consistent with `paid` and `pending` values
   - Validate that `paid + pending = amount`

3. **Filtering**:
   - Class filter should match exact class name
   - Status filter should check overall student status (not individual fee status)
   - Search should be case-insensitive and match both name and code

4. **Empty States**:
   - Students with no fees should still appear in the list
   - Show appropriate message when no students match filters

5. **Security**:
   - Verify user has accountant role/permissions
   - Only return students from the same school as the accountant
   - Validate all input parameters

---

## Testing Checklist

- [ ] Primary endpoint returns all students with fees
- [ ] Multiple fees for same student are returned correctly
- [ ] Students with no fees are included (or handled gracefully)
- [ ] Class filter works correctly
- [ ] Status filter works correctly (overall status, not individual fee status)
- [ ] Search filter works for both name and code
- [ ] Fallback endpoints work when primary fails
- [ ] Create fee API creates fee correctly
- [ ] Update fee API updates fee correctly
- [ ] All endpoints handle errors gracefully
- [ ] All endpoints require authentication
- [ ] Data consistency (paid + pending = amount)
- [ ] Overall status calculation is correct

---

## Example SQL Query (for reference)

If implementing the primary endpoint, here's an example SQL structure:

```sql
SELECT 
  s.id AS student_id,
  s.first_name || ' ' || s.last_name AS student_name,
  s.student_code,
  c.name AS class_name,
  s.roll_number,
  f.id AS fee_id,
  f.fee_type,
  f.amount,
  COALESCE(SUM(p.amount), 0) AS paid,
  f.amount - COALESCE(SUM(p.amount), 0) AS pending,
  CASE 
    WHEN COALESCE(SUM(p.amount), 0) = 0 THEN 'pending'
    WHEN COALESCE(SUM(p.amount), 0) >= f.amount THEN 'paid'
    ELSE 'partial'
  END AS status,
  f.due_date,
  f.term,
  f.description
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN student_fees f ON s.id = f.student_id
LEFT JOIN fee_payments p ON f.id = p.fee_id
WHERE s.school_id = ?
GROUP BY s.id, f.id
ORDER BY s.student_code, f.due_date
```

Note: Adjust table and column names according to your database schema.




