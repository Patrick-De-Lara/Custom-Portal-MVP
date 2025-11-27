import axios, { AxiosInstance, AxiosError } from 'axios';

interface LoginCredentials {
  email: string;
  phone: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add token
    this.api.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );

    // Load token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('customer');
    }
  }

  getToken() {
    return this.token;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials) {
    const response = await this.api.post('/auth/login', credentials);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('customer', JSON.stringify(response.data.data.customer));
      }
    }
    return response.data;
  }

  async register(data: RegisterData) {
    const response = await this.api.post('/auth/register', data);
    if (response.data.success && response.data.data.token) {
      this.setToken(response.data.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('customer', JSON.stringify(response.data.data.customer));
      }
    }
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  // Booking endpoints
  async getBookings() {
    const response = await this.api.get('/bookings');
    return response.data;
  }

  async getBookingById(id: number) {
    const response = await this.api.get(`/bookings/${id}`);
    return response.data;
  }

  async createBooking(data: any) {
    const response = await this.api.post('/bookings', data);
    return response.data;
  }

  // Message endpoints
  async getMessages(bookingId: number) {
    const response = await this.api.get(`/messages/${bookingId}`);
    return response.data;
  }

  async sendMessage(bookingId: number, content: string) {
    const response = await this.api.post(`/messages/${bookingId}`, { content });
    return response.data;
  }

  // File endpoints
  async getFiles(bookingId: number) {
    const response = await this.api.get(`/files/${bookingId}`);
    return response.data;
  }
}

export default new ApiService();
