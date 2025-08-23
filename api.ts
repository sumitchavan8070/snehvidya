const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"

class ApiClient {
  getClassStudents() {
    throw new Error("Method not implemented.")
  }


  markAttendance(student: { student_id: number; date: string; status: "present" | "absent" | null; remarks: string }) {
    return this.request<any>("/auth/profile")
  }


  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL

    // Get token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("accessToken")
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Authentication
  async login(credentials: {
    email: string
    password: string
    schoolId: string
    roleId: string
  }) {
    const response = await this.request<any>("/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })

    if (response.data?.accessToken) {
      this.setToken(response.data.accessToken)
    }

    return response
  }

  async getProfile() {
    return this.request<any>("/auth/profile")
  }

  async getRoles() {
    return this.request<any>("/auth/roles")
  }

  async getSchools() {
    return this.request<any>("/auth/schools")
  }

  // Attendance
  async getTodayStaffAttendance() {
    return this.request<any>("/attendance/staff/today")
  }

  async getTodayStudentAttendance() {
    return this.request<any>("/attendance/students/today")
  }

  async getStaffAttendanceStats(date?: string) {
    const params = date ? `?date=${date}` : ""
    return this.request<any>(`/attendance/staff/stats${params}`)
  }

  async getStudentAttendanceStats(date?: string) {
    const params = date ? `?date=${date}` : ""
    return this.request<any>(`/attendance/students/stats${params}`)
  }

  async markStaffAttendance(data: {
    staffId: number
    date: string
    status: string
    checkInTime?: string
    checkOutTime?: string
    notes?: string
  }) {
    return this.request<any>("/attendance/staff/mark", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // Leaves
  async getLeaveTypes(userId: number) {
    // const response = await fetch(`${API_BASE_URL}/types?userId=${userId}`, {
    //   headers: { 'Authorization': `Bearer ${AUTH_TOKEN}` },
    // });
    // return await response.json();

    return this.request<any>(`/leaves/types?userId=${userId}`);
  }

  async getPendingStaffLeaves(userId: number) {
    return this.request<any>(`/leaves/staff/pending?userId=${userId}`)
  }


  async getStaffLeaveHistory(userId: number, staffId: number) {
    return this.request<any>(`/leaves/staff/history?userId=${userId}&staffId=${staffId}`)
  }



  async getPendingStudentLeaves() {
    return this.request<any>("/leaves/students/pending")
  }

  async applyStaffLeave(userId: number, dto: { leaveTypeId: number; startDate: string; endDate: string; reason: string; medicalCertificate: null; }) {

    return this.request<any>("/leaves/staff/apply", {
      method: "POST",
      body: JSON.stringify({ ...dto, userId }),
    })
  }

  async approveStaffLeave(
    leaveId: number, p0: { status: string; }
  ) {
    return this.request<any>(`/leaves/staff/${leaveId}/approve`, {
      method: "POST",
      body: JSON.stringify({ leaveId, p0 }),
    })
  }

  // Fees
  async getFeeCategories() {
    return this.request<any>("/fees/categories")
  }

  async getStudentFees(studentId: number) {
    return this.request<any>(`/fees/student/${studentId}`)
  }

  async getPendingFees() {
    return this.request<any>("/fees/pending")
  }

  async recordPayment(data: {
    studentFeeId: number
    amount: number
    paymentMethod: string
    transactionId?: string
    notes?: string
  }) {
    return this.request<any>("/fees/payment", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async getFeeCollectionReport(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    const queryString = params.toString()

    return this.request<any>(`/fees/reports/collection${queryString ? `?${queryString}` : ""}`)
  }

  // Users
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

    return this.request<any>(`/users${queryString ? `?${queryString}` : ""}`)
  }

  async createUser(data: {
    email: string
    firstName: string
    lastName: string
    roleId: number
    phone?: string
    department?: string
    designation?: string
    salary?: number
  }) {
    return this.request<any>("/users/create-new-user", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateUser(
    userId: number,
    data: Partial<{
      firstName: string
      lastName: string
      phone: string
      department: string
      designation: string
      salary: number
      status: string
    }>,
  ) {
    return this.request<any>(`/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteUser(userId: number) {
    return this.request<any>(`/users/${userId}`, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
export default apiClient
