// src/common/http-client/http-client.service.ts

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'; // Use axios directly
// Remove NestJS-specific imports like @nestjs/common and @nestjs/axios

export class HttpClientService { // Renamed to avoid confusion with the instance
  private baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  private token: string | null = null;

  constructor() {
    // No need for HttpService injection here
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async getRequest<T = any>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response: AxiosResponse<T> = await axios.get<T>(url, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('GET request failed:', error);
      throw error;
    }
  }

  async postRequest<T = any>(endpoint: string, postData: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response: AxiosResponse<T> = await axios.post<T>(url, postData, {
        headers: this.getHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('POST request failed:', error);
      throw error;
    }
  }
}
