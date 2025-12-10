# Backend API Development Prompt for MCQ Exam System

Create a complete REST API backend for a School Management System's MCQ Exam module. Use NestJS with TypeORM and MySQL.

## Database Schema

The following tables already exist in the database:

### 1. `mcq_exams` table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL)
- `class_id` (INT, NOT NULL)
- `exam_date` (DATE, NOT NULL)
- `total_questions` (INT, NOT NULL)
- `total_marks` (INT, NOT NULL)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 2. `mcq_questions` table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `exam_id` (INT, NOT NULL, FOREIGN KEY to mcq_exams.id)
- `question_number` (INT, NOT NULL)
- `question_text` (TEXT, NOT NULL)
- `option_a` (VARCHAR(500), NOT NULL)
- `option_b` (VARCHAR(500), NOT NULL)
- `option_c` (VARCHAR(500), NOT NULL)
- `option_d` (VARCHAR(500), NOT NULL)
- `correct_answer` (ENUM('A', 'B', 'C', 'D'), NOT NULL)
- `marks` (INT, NOT NULL, DEFAULT 1)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)

### 3. `student_exam_submissions` table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `exam_id` (INT, NOT NULL, FOREIGN KEY to mcq_exams.id)
- `student_id` (INT, NOT NULL)
- `started_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `submitted_at` (TIMESTAMP, NULL)
- `status` (ENUM('in_progress', 'submitted', 'graded'), DEFAULT 'in_progress')
- `total_score` (DECIMAL(10,2), DEFAULT 0)
- `percentage` (DECIMAL(5,2), DEFAULT 0)
- `time_taken_minutes` (INT, DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- UNIQUE KEY: `unique_student_exam` (exam_id, student_id)

### 4. `student_exam_answers` table
- `id` (INT, PRIMARY KEY, AUTO_INCREMENT)
- `submission_id` (INT, NOT NULL, FOREIGN KEY to student_exam_submissions.id)
- `question_id` (INT, NOT NULL, FOREIGN KEY to mcq_questions.id)
- `student_answer` (ENUM('A', 'B', 'C', 'D'), NULL)
- `is_correct` (BOOLEAN, DEFAULT FALSE)
- `marks_obtained` (DECIMAL(10,2), DEFAULT 0)
- `created_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
- `updated_at` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)
- UNIQUE KEY: `unique_submission_question` (submission_id, question_id)

### 5. `students` table (assumed to exist)
- `id` (INT, PRIMARY KEY)
- `class_id` (INT)
- Other student fields...

## Required API Endpoints

### Teacher/Admin Endpoints (for creating and managing exams)

#### 1. Create MCQ Exam
**POST** `/api/exams/mcq`
- **Request Body:**
```json
{
  "name": "Mathematics Mid-Term Exam",
  "classId": 1,
  "date": "2024-12-15",
  "totalQuestions": 20,
  "totalMarks": 100,
  "questions": [
    {
      "id": 1,
      "question": "What is 2+2?",
      "optionA": "3",
      "optionB": "4",
      "optionC": "5",
      "optionD": "6",
      "correctAnswer": "B",
      "marks": 5
    },
    // ... more questions
  ]
}
```
- **Response:**
```json
{
  "success": true,
  "message": "MCQ exam created successfully",
  "examId": 1
}
```
- **Validation:** Ensure all questions have all 4 options and correct answer set

#### 2. Get All MCQ Exams
**GET** `/api/exams/mcq`
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Mathematics Mid-Term Exam",
    "classId": 1,
    "date": "2024-12-15",
    "totalQuestions": 20,
    "totalMarks": 100,
    "createdAt": "2024-11-01T10:00:00Z",
    "questions": [
      {
        "id": 1,
        "question": "What is 2+2?",
        "optionA": "3",
        "optionB": "4",
        "optionC": "5",
        "optionD": "6",
        "correctAnswer": "B",
        "marks": 5
      }
    ]
  }
]
```

#### 3. Get MCQ Exam by ID
**GET** `/api/exams/mcq/:id`
- **Response:** Same format as single exam object above

#### 4. Delete MCQ Exam
**DELETE** `/api/exams/mcq/:id`
- **Response:**
```json
{
  "success": true,
  "message": "Exam deleted successfully"
}
```
- **Note:** Should cascade delete questions and submissions

### Student Endpoints (for taking exams)

#### 5. Get Exams for Student
**GET** `/api/student/exams?studentId=1`
- **Logic:** Get all exams where `class_id` matches student's `class_id`
- **Response:**
```json
[
  {
    "id": 1,
    "name": "Mathematics Mid-Term Exam",
    "classId": 1,
    "date": "2024-12-15",
    "totalQuestions": 20,
    "totalMarks": 100,
    "createdAt": "2024-11-01T10:00:00Z"
  }
]
```

#### 6. Get Student Exam Submissions
**GET** `/api/student/exams/submissions?studentId=1`
- **Response:**
```json
[
  {
    "id": 1,
    "examId": 1,
    "status": "graded",
    "totalScore": 85.5,
    "percentage": 85.5,
    "submittedAt": "2024-12-15T14:30:00Z",
    "startedAt": "2024-12-15T14:00:00Z",
    "timeTakenMinutes": 30
  }
]
```

#### 7. Get Student Submission for Specific Exam
**GET** `/api/student/exams/:examId/submission?studentId=1`
- **Response:** Single submission object (same format as above) or null if not found

#### 8. Start/Get Exam Submission
**POST** `/api/student/exams/submissions`
- **Request Body:**
```json
{
  "studentId": 1,
  "examId": 1
}
```
- **Response:**
```json
{
  "id": 1,
  "status": "in_progress"
}
```
- **Logic:** 
  - If submission exists, return it
  - If not, create new submission with status "in_progress"

#### 9. Save Student Answer (Auto-save)
**POST** `/api/student/exams/submissions/:submissionId/answers`
- **Request Body:**
```json
{
  "questionId": 1,
  "studentAnswer": "B"
}
```
- **Response:**
```json
{
  "success": true
}
```
- **Logic:**
  - Get question's correct answer and marks
  - Check if student answer is correct
  - Insert or update answer in `student_exam_answers` table
  - Set `is_correct` and `marks_obtained` accordingly

#### 10. Get Student Answers for Submission
**GET** `/api/student/exams/submissions/:submissionId/answers`
- **Response:**
```json
[
  {
    "questionId": 1,
    "studentAnswer": "B",
    "isCorrect": true,
    "marksObtained": 5
  }
]
```

#### 11. Submit Exam
**POST** `/api/student/exams/submit`
- **Request Body:**
```json
{
  "studentId": 1,
  "examId": 1,
  "answers": {
    "1": "B",
    "2": "A",
    "3": "C"
  },
  "timeTakenMinutes": 30
}
```
- **Response:**
```json
{
  "success": true,
  "submissionId": 1,
  "totalScore": 85.5,
  "totalMarks": 100,
  "percentage": "85.50"
}
```
- **Logic:**
  1. Get or create submission
  2. For each question in exam:
     - Get student's answer from request
     - Get correct answer from `mcq_questions` table
     - Calculate if correct and marks obtained
     - Save to `student_exam_answers` table
  3. Calculate total score and percentage
  4. Update submission:
     - Set status to "submitted"
     - Set `submitted_at` to current timestamp
     - Set `total_score`, `percentage`, `time_taken_minutes`
  5. Return results

## Additional Requirements

1. **Authentication:** All endpoints should require JWT authentication (Bearer token)
2. **Authorization:** 
   - Teacher/Admin can create/delete exams
   - Students can only access their own submissions
3. **Error Handling:** Return proper HTTP status codes and error messages
4. **Validation:** Validate all input data (required fields, data types, enum values)
5. **Database Transactions:** Use transactions for exam submission to ensure data consistency
6. **Response Format:** Always return JSON with consistent structure

## Response Format Standards

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

### Teacher/Admin Results Endpoints

#### 12. Get Student Submissions for Exam
**GET** `/api/exams/:examId/submissions`
- **Response:**
```json
[
  {
    "id": 1,
    "studentId": 101,
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "status": "graded",
    "totalScore": 85.5,
    "percentage": 85.5,
    "submittedAt": "2024-12-15T14:30:00Z",
    "startedAt": "2024-12-15T14:00:00Z",
    "timeTakenMinutes": 30
  }
]
```
- **Logic:** Get all submissions for a specific exam, include student name and email from students/users table

#### 13. Get Student Submission Details
**GET** `/api/exams/submissions/:submissionId`
- **Response:**
```json
{
  "id": 1,
  "studentId": 101,
  "studentName": "John Doe",
  "examId": 1,
  "status": "graded",
  "totalScore": 85.5,
  "percentage": 85.5,
  "submittedAt": "2024-12-15T14:30:00Z",
  "startedAt": "2024-12-15T14:00:00Z",
  "timeTakenMinutes": 30,
  "answers": [
    {
      "questionId": 1,
      "questionText": "What is 2+2?",
      "studentAnswer": "B",
      "correctAnswer": "B",
      "isCorrect": true,
      "marksObtained": 5
    }
  ]
}
```
- **Logic:** Get detailed submission with all answers and question details

## Important Notes

- Use TypeORM entities matching the database schema
- Implement proper foreign key relationships
- Handle cascade deletes appropriately
- Ensure unique constraints are enforced
- Calculate scores automatically on submission
- Support auto-save functionality for answers
- Prevent duplicate submissions (check status before allowing submission)
- For teacher results endpoints, join with students/users table to get student names

