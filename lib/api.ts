import { toast } from "sonner"
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://172.23.17.194:8080/api"

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = API_BASE_URL
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    // Log request details for bulk attendance endpoint
    if (endpoint.includes("mark-students-bulk-attendance")) {
      console.log("=== API REQUEST DETAILS ===")
      console.log("URL:", url)
      console.log("Method:", options.method || "GET")
      if (options.body) {
        try {
          const body = JSON.parse(options.body as string)
          console.log("Request Body:", JSON.stringify(body, null, 2))
        } catch (e) {
          console.log("Request Body (raw):", options.body)
        }
      }
      console.log("Headers:", headers)
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: "no-store", // Prevents caching in fetch
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`
        const error = new Error(errorMessage) as any
        error.status = response.status
        
        if (endpoint.includes("mark-students-bulk-attendance")) {
          console.error("=== API ERROR RESPONSE ===")
          console.error("Status:", response.status)
          console.error("Error Data:", errorData)
        }
        
        throw error
      }

      const data = await response.json()
      
      // Log response for bulk attendance endpoint
      if (endpoint.includes("mark-students-bulk-attendance")) {
        console.log("=== API RESPONSE ===")
        console.log("Status:", response.status)
        console.log("Response Data:", JSON.stringify(data, null, 2))
        console.log("====================")
      }
      
      // Handle backend response format (if data is wrapped in 'data' property)
      if (data.data !== undefined && data.success !== undefined) {
        return data.data
      }
      
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }


  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/client-login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  async changePassword(payload: { currentPassword: string; newPassword: string; confirmPassword: string }) {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  async getStaffAttendance(date: string) {

    return this.request(`/attendance/get-attendance-by-user-and-date?date=${date}`)
  }



  async getProfile() {
    return this.request("/auth/profile")
  }

  getClassStudents(formattedDate: string) {
    return this.request(`/class/get-students-by-class?schoolId=1&date=${formattedDate}`)

  }
  markBulkAttendance(records: { records: { student_id: number; date: string; status: "present" | "absent" | null; remarks: string | null }[] }) {
    console.log("=== BULK ATTENDANCE API CALL ===")
    console.log("Endpoint:", `${this.baseURL}/attendance/mark-students-bulk-attendance`)
    console.log("Request Payload:", JSON.stringify(records, null, 2))
    console.log("Number of records:", records.records.length)
    console.log("Dates in records:", [...new Set(records.records.map(r => r.date))])
    console.log("=================================")
    
    return this.request("/attendance/mark-students-bulk-attendance", {
      method: "POST",
      body: JSON.stringify(records),
    })
  }




  // Users endpoints
  async getUsers(params?: {
    role?: string
    department?: string
    search?: string
    page?: number
    limit?: number
  }) {
    const queryParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString())
        }
      })
    }
    const queryString = queryParams.toString()
    return this.request(`/users${queryString ? `?${queryString}` : ""}`)
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(userData),
    })
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, {
      method: "DELETE",
    })
  }

  // Attendance endpoints
  async getAttendance(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : ""
    return this.request(`/attendance${queryString}`)
  }

  async markAttendance(attendanceData: any) {
    return this.request("/attendance/mark-attendance", {
      method: "POST",
      body: JSON.stringify(attendanceData),
    })
  }


  async getFeesList(){
    return this.request("/class/get-fees-list-by-class-teacher")
  }

  async getFeesStructure(){
    // Use backend API endpoint
    return this.request("/fees-structure", {
      method: "GET",
    })
  }

  async createFeesStructure(feesData: any) {
    // Use backend API endpoint
    return this.request("/fees-structure", {
      method: "POST",
      body: JSON.stringify(feesData),
    })
  }

  async updateFeesStructure(schoolId: number, id: number, feesData: any) {
    // Use backend API endpoint - PATCH /mobileapi/v1/fees-structure/:school_id/:id
    return this.request(`/fees-structure/${schoolId}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(feesData),
    })
  }

  async deleteFeesStructure(schoolId: number, id: number) {
    // Note: Delete endpoint not in docs, but keeping for now
    // You may need to add DELETE endpoint to backend
    return this.request(`/fees-structure/${schoolId}/${id}`, {
      method: "DELETE",
    })
  }

  async getFeeServices() {
    return fetch("/fees-structure/services", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }).then(res => res.json())
  }

  async createFeeService(serviceData: any) {
    return fetch("/fees-structure/services", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(serviceData),
    }).then(res => res.json())
  }

  // Section Extra Fees endpoints
  async getSectionExtraFees(params?: { class_name?: string; section?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.class_name) queryParams.append("class_name", params.class_name)
    if (params?.section) queryParams.append("section", params.section)
    
    const queryString = queryParams.toString()
    return fetch(`/fees-structure/section-extra-fees${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }).then(res => res.json())
  }

  async createSectionExtraFee(feeData: any) {
    return fetch("/fees-structure/section-extra-fees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feeData),
    }).then(res => res.json())
  }

  async updateSectionExtraFee(id: number, feeData: any) {
    return fetch(`/fees-structure/section-extra-fees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feeData),
    }).then(res => res.json())
  }

  async deleteSectionExtraFee(id: number) {
    return fetch(`/fees-structure/section-extra-fees/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(res => res.json())
  }

  // Calculate quarters
  async calculateQuarters(totalAmount: number, distributionType: "equal" | "custom" = "equal", customDistribution?: any) {
    return fetch("/fees-structure/calculate-quarters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        total_amount: totalAmount,
        distribution_type: distributionType,
        custom_distribution: customDistribution,
      }),
    }).then(res => res.json())
  }

  // Class-wise payments
  async getClassWisePayments(params?: { class_name?: string; section?: string; quarter?: string; status?: string }) {
    const queryParams = new URLSearchParams()
    if (params?.class_name) queryParams.append("class_name", params.class_name)
    if (params?.section) queryParams.append("section", params.section)
    if (params?.quarter) queryParams.append("quarter", params.quarter)
    if (params?.status) queryParams.append("status", params.status)
    
    const queryString = queryParams.toString()
    return fetch(`/fees-structure/payments/class-wise${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }).then(res => res.json())
  }

  // Student Services endpoints
  async getStudentServices(params?: { studentId?: number; classId?: number; serviceName?: string; isActive?: boolean }) {
    const queryParams = new URLSearchParams()
    if (params?.studentId) queryParams.append("studentId", params.studentId.toString())
    if (params?.classId) queryParams.append("classId", params.classId.toString())
    if (params?.serviceName) queryParams.append("serviceName", params.serviceName)
    if (params?.isActive !== undefined) queryParams.append("isActive", params.isActive.toString())
    
    const queryString = queryParams.toString()
    return this.request(`/student-services${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    })
  }

  async createStudentService(serviceData: any) {
    return this.request("/student-services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    })
  }

  async updateStudentService(id: number, serviceData: any) {
    return this.request(`/student-services/${id}`, {
      method: "PATCH",
      body: JSON.stringify(serviceData),
    })
  }

  async deleteStudentService(id: number) {
    return this.request(`/student-services/${id}`, {
      method: "DELETE",
    })
  }

    getTimetable(){
    return this.request("/timetable")

  }

  async getAnnouncements(){
    return this.request("/announcements/get-announcements")
  }

  // Exam endpoints - Using Backend API
  async createMCQExam(examData: any) {
    return this.request("/exams/mcq", {
      method: "POST",
      body: JSON.stringify(examData),
    })
  }

  async getMCQExams() {
    return this.request("/exams/mcq")
  }

  async getMCQExamById(examId: number) {
    return this.request(`/exams/mcq/${examId}`)
  }

  async deleteMCQExam(examId: number) {
    return this.request(`/exams/mcq/${examId}`, {
      method: "DELETE",
    })
  }

  // Student Exam endpoints - Using Backend API
  async getStudentExams(studentId: number) {
    return this.request(`/student/exams?studentId=${studentId}`)
  }

  async getStudentExamSubmissions(studentId: number) {
    return this.request(`/student/exams/submissions?studentId=${studentId}`)
  }

  async getStudentExamSubmission(studentId: number, examId: number) {
    try {
      return await this.request(`/student/exams/${examId}/submission?studentId=${studentId}`)
    } catch (error: any) {
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        return null
      }
      throw error
    }
  }

  async submitStudentExam(
    studentId: number,
    examId: number,
    answers: Record<number, "A" | "B" | "C" | "D">,
    timeTakenMinutes: number
  ) {
    return this.request("/student/exams/submit", {
      method: "POST",
      body: JSON.stringify({ studentId, examId, answers, timeTakenMinutes }),
    })
  }

  async saveStudentExamAnswer(
    studentId: number,
    examId: number,
    questionId: number,
    answer: "A" | "B" | "C" | "D"
  ) {
    // First get or create submission
    const submission = await this.request("/student/exams/submissions", {
      method: "POST",
      body: JSON.stringify({ studentId, examId }),
    })

    // Save answer
    return this.request(`/student/exams/submissions/${submission.id}/answers`, {
      method: "POST",
      body: JSON.stringify({ questionId, studentAnswer: answer }),
    })
  }

  async getStudentExamAnswers(submissionId: number) {
    return this.request(`/student/exams/submissions/${submissionId}/answers`)
  }

  // Teacher Exam Results endpoints
  async getExamSubmissions(examId: number) {
    console.log(`[API] Fetching submissions for exam ${examId}`)
    console.log(`[API] Endpoint: /exams/${examId}/submissions`)
    try {
      const result = await this.request(`/exams/${examId}/submissions`)
      console.log(`[API] Response received:`, result)
      return result
    } catch (error: any) {
      console.error(`[API] Error fetching submissions:`, error)
      console.error(`[API] Error status:`, error.status)
      console.error(`[API] Error message:`, error.message)
      throw error
    }
  }

  async getStudentSubmissionDetails(submissionId: number) {
    return this.request(`/exams/submissions/${submissionId}`)
  }

  async getStudentInfo(studentId: number) {
    try {
      return await this.request(`/users/${studentId}`)
    } catch (error) {
      // Try students endpoint if users doesn't work
      try {
        return await this.request(`/students/${studentId}`)
      } catch (e) {
        throw error
      }
    }
  }
// updateFeesStructure(id: number , formData){
//     return this.request("/fees-structure")

// }



  // Reports endpoints
  async getDashboardStats() {
    return this.request("/reports/dashboard-stats")
  }

  async getAttendanceReport(params: any) {
    const queryString = new URLSearchParams(params)
    return this.request(`/reports/attendance?${queryString}`)
  }

  // Schools endpoints
  async getSchools() {
    return this.request("/schools")
  }

  async createSchool(schoolData: any) {
    return this.request("/schools", {
      method: "POST",
      body: JSON.stringify(schoolData),
    })
  }

  // Leave Management APIs - Using main base URL
  // Student Leave APIs
  async studentApplyLeave(data: {
    userId: number
    startDate: string
    endDate: string
    reason: string
    medicalCertificate?: string
  }) {
    return this.request("/leaves/student/apply", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getStudentLeaveHistory(userId: number) {
    return this.request(`/leaves/student/history?userId=${userId}`)
  }

  // Teacher Leave APIs - Student Leaves
  async getPendingStudentLeaves(userId: number) {
    return this.request(`/leaves/student/pending?userId=${userId}`)
  }

  async approveRejectStudentLeave(
    leaveId: number,
    data: {
      userId: number
      status: "approved" | "rejected"
      rejectionReason?: string
    }
  ) {
    return this.request(`/leaves/student/${leaveId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Teacher Leave APIs - Staff Leaves
  async applyStaffLeave(
    userId: number,
    data: {
      leaveTypeId: number
      startDate: string
      endDate: string
      reason: string
      medicalCertificate?: string
    }
  ) {
    return this.request("/leaves/staff/apply", {
      method: "POST",
      body: JSON.stringify({
        userId,
        ...data,
      }),
    })
  }

  async getStaffLeaveHistory(userId: number, staffId?: number) {
    const query = staffId 
      ? `?userId=${userId}&staffId=${staffId}`
      : `?userId=${userId}`
    return this.request(`/leaves/staff/history${query}`)
  }

  // Principal APIs - Dashboard
  async getPrincipalDashboardStats() {
    return this.request("/principal/dashboard/stats")
  }

  async getPrincipalRecentActivities(limit?: number) {
    const query = limit ? `?limit=${limit}` : ""
    return this.request(`/principal/dashboard/activities${query}`)
  }

  // Principal APIs - Class Management
  async getPrincipalClasses() {
    return this.request("/principal/classes")
  }

  async createPrincipalClass(data: {
    className: string
    grade: string
    section?: string
    capacity?: number
    academicYear?: string
  }) {
    return this.request("/principal/classes", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getPrincipalTeachers() {
    return this.request("/principal/teachers")
  }

  async assignTeacherToClass(classId: number, teacherId: number) {
    return this.request(`/principal/classes/${classId}/assign-teacher`, {
      method: "POST",
      body: JSON.stringify({ teacherId }),
    })
  }

  async unassignTeacherFromClass(classId: number) {
    return this.request(`/principal/classes/${classId}/unassign-teacher`, {
      method: "DELETE",
    })
  }

  // Principal APIs - Teacher Leaves
  async getPendingTeacherLeaves(userId: number) {
    return this.request(`/leaves/teacher/pending?userId=${userId}`)
  }

  async approveRejectTeacherLeave(
    leaveId: number,
    data: {
      userId: number
      status: "approved" | "rejected"
      rejectionReason?: string
    }
  ) {
    return this.request(`/leaves/teacher/${leaveId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Principal APIs - Attendance Management
  async getPrincipalAttendanceStats(date?: string) {
    const queryString = date ? `?date=${date}` : ""
    return this.request(`/principal/attendance/stats${queryString}`)
  }

  async getPrincipalStaffAttendance(date: string, params?: { search?: string; department?: string }) {
    const queryParams = new URLSearchParams({ date })
    if (params?.search) queryParams.append("search", params.search)
    if (params?.department) queryParams.append("department", params.department)
    return this.request(`/principal/attendance/staff?${queryParams.toString()}`)
  }

  async getPrincipalStudentAttendanceByClass(date: string) {
    return this.request(`/principal/attendance/students/class?date=${date}`)
  }

  async getPrincipalStudentAttendanceDetails(classId: string, date: string) {
    return this.request(`/principal/attendance/students/class/${classId}?date=${date}`)
  }

  async exportPrincipalAttendanceReport(date: string, type: "staff" | "students" | "both") {
    return this.request(`/principal/attendance/export?date=${date}&type=${type}`, {
      method: "GET",
      // Note: File download handling may need special responseType
    })
  }

  // Common APIs
  async getLeaveTypes(userId: number) {
    return this.request(`/leaves/types?userId=${userId}`)
  }

  // Support/Client Query API
  async sendClientQuery(data: {
    email: string
    phone: string
    subject: string
    priority: string
    date: string
    query: string
  }) {
    return this.request("/email/send/clientquery", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // IT Admin APIs
  async getITAdminDashboardStats() {
    return this.request("/it-admin/dashboard/stats")
  }

  async getITAdminUsers(params?: { page?: number; limit?: number; role?: string; search?: string }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/it-admin/users${queryString}`)
  }

  async getITAdminLogs(params?: { page?: number; limit?: number; level?: string; startDate?: string; endDate?: string }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/it-admin/logs${queryString}`)
  }

  async createDatabaseBackup(data: { backupType: string; description?: string }) {
    return this.request("/it-admin/backup/create", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getBackupList() {
    return this.request("/it-admin/backup/list")
  }

  // Accountant APIs
  async getAccountantDashboardStats(params?: { month?: string; year?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/accountant/dashboard/stats${queryString}`)
  }

  async getRecentTransactions(limit?: number) {
    const query = limit ? `?limit=${limit}` : ""
    return this.request(`/accountant/transactions/recent${query}`)
  }

  async getTransactions(params?: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string; type?: string }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/accountant/transactions${queryString}`)
  }

  async processPayment(data: { studentId: number; amount: number; paymentMethod: string; paymentDate: string; description?: string; receiptNumber?: string }) {
    return this.request("/accountant/payments/process", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async generateInvoice(data: { studentId: number; feeType: string; amount: number; dueDate: string; description?: string }) {
    return this.request("/accountant/invoices/generate", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getFinancialReports(params: { reportType: string; startDate?: string; endDate?: string; month?: string; year?: number }) {
    const queryString = `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
    return this.request(`/accountant/reports/financial${queryString}`)
  }

  // Parent APIs
  async getParentDashboardStats() {
    return this.request("/parent/dashboard/stats")
  }

  async getParentChildren() {
    return this.request("/parent/children")
  }

  async getChildAttendance(childId: number, params?: { month?: string; year?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/parent/children/${childId}/attendance${queryString}`)
  }

  async getChildGrades(childId: number, params?: { examType?: string; subject?: string }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/parent/children/${childId}/grades${queryString}`)
  }

  async getChildFees(childId: number) {
    return this.request(`/parent/children/${childId}/fees`)
  }

  async getParentMessages(unreadOnly?: boolean) {
    const query = unreadOnly !== undefined ? `?unreadOnly=${unreadOnly}` : ""
    return this.request(`/parent/messages${query}`)
  }

  // Support Staff APIs
  async getSupportStaffDashboardStats() {
    return this.request("/support-staff/dashboard/stats")
  }

  async getMaintenanceRequests(params?: { status?: string; priority?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/support-staff/maintenance/requests${queryString}`)
  }

  async updateMaintenanceRequestStatus(requestId: number, data: { status: string; notes?: string }) {
    return this.request(`/support-staff/maintenance/requests/${requestId}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    })
  }

  async completeMaintenanceRequest(requestId: number, data: { notes?: string; cost?: number }) {
    return this.request(`/support-staff/maintenance/requests/${requestId}/complete`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getFacilities() {
    return this.request("/support-staff/facilities")
  }

  // Librarian APIs
  async getLibrarianDashboardStats() {
    return this.request("/librarian/dashboard/stats")
  }

  async getBooks(params?: { page?: number; limit?: number; search?: string; category?: string; status?: string }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/librarian/books${queryString}`)
  }

  async issueBook(data: { bookId: number; studentId: number; issueDate: string; dueDate: string }) {
    return this.request("/librarian/books/issue", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async returnBook(data: { issueId: number; returnDate: string }) {
    return this.request("/librarian/books/return", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getIssuedBooks(params?: { studentId?: number; status?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/librarian/books/issued${queryString}`)
  }

  async getLibraryReports(params: { reportType: string; startDate?: string; endDate?: string }) {
    const queryString = `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
    return this.request(`/librarian/reports${queryString}`)
  }

  // Nurse/Medical APIs
  async getNurseDashboardStats(date?: string) {
    const query = date ? `?date=${date}` : ""
    return this.request(`/nurse/dashboard/stats${query}`)
  }

  async getTodayAppointments(date?: string) {
    const query = date ? `?date=${date}` : ""
    return this.request(`/nurse/appointments/today${query}`)
  }

  async getHealthRecords(params?: { studentId?: number; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/nurse/health-records${queryString}`)
  }

  async addHealthRecord(data: { studentId: number; recordType: string; date: string; temperature?: number; bloodPressure?: string; weight?: number; height?: number; notes?: string; symptoms?: string[]; diagnosis?: string }) {
    return this.request("/nurse/health-records", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async scheduleAppointment(data: { studentId: number; appointmentType: string; scheduledDate: string; scheduledTime: string; reason?: string; priority?: string }) {
    return this.request("/nurse/appointments", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getActiveMedications(studentId?: number) {
    const query = studentId ? `?studentId=${studentId}` : ""
    return this.request(`/nurse/medications/active${query}`)
  }

  async getHealthReport(params: { studentId: number; startDate?: string; endDate?: string }) {
    const queryString = `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}`
    return this.request(`/nurse/reports/health${queryString}`)
  }

  // Security APIs
  async getSecurityDashboardStats(date?: string) {
    const query = date ? `?date=${date}` : ""
    return this.request(`/security/dashboard/stats${query}`)
  }

  async registerVisitor(data: { name: string; phone: string; email?: string; purpose: string; visitingPerson: string; expectedDuration?: number; idProof?: string; idProofNumber?: string }) {
    return this.request("/security/visitors/register", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkoutVisitor(visitorId: number, data?: { notes?: string }) {
    return this.request(`/security/visitors/${visitorId}/checkout`, {
      method: "POST",
      body: JSON.stringify(data || {}),
    })
  }

  async getVisitors(params?: { status?: string; date?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/security/visitors${queryString}`)
  }

  async getEntryExitLogs(params?: { date?: string; type?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/security/logs${queryString}`)
  }

  async reportIncident(data: { type: string; severity: string; description: string; location: string; reportedBy: string; incidentDate: string; incidentTime: string }) {
    return this.request("/security/incidents", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getIncidents(params?: { status?: string; severity?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) {
    const queryString = params ? `?${new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()}` : ""
    return this.request(`/security/incidents${queryString}`)
  }
}

export const api = new ApiClient()
