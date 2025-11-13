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
    toast.error(`api url : ${url}`)


    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json"
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    console.log(headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        cache: "no-store", // Prevents caching in fetch

      })

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
    return this.request("/attendance/mark-students-bulk-attendance", {
      method: "POST",
      body: JSON.stringify(records),
    })
  }




  // Users endpoints
  async getUsers() {
    return this.request("/users")
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

  getFeesStructure(){
    return this.request("/fees-structure")

  }

    getTimetable(){
    return this.request("/timetable")

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
}

export const api = new ApiClient()
