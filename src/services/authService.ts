import { apiClient } from '../lib/apiClient';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export interface AuthToken {
  accessToken: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'INSTRUCTOR';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

class AuthService {
  async register(data: RegisterRequest): Promise<void> {
    try {
      await apiClient.post('/auth/register', data);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async verifyOtp(data: VerifyOtpRequest): Promise<AuthToken> {
    try {
      const response = await apiClient.post<AuthToken>('/auth/verify-otp', data);
      const token = response.data.accessToken;
      apiClient.setToken(token);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async resendOtp(data: ResendOtpRequest): Promise<void> {
    try {
      await apiClient.post('/auth/resend-otp', data);
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async login(data: LoginRequest): Promise<AuthToken> {
    try {
      const response = await apiClient.post<AuthToken>('/auth/login', data);
      const token = response.data.accessToken;
      apiClient.setToken(token);
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch (error: unknown) {
      throw this.handleError(error);
    }
  }

  logout(): void {
    apiClient.clearToken();
  }

  isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('409')) {
        return new Error('Email already in use. Please try another one or sign in.');
      }
      if (error.message.includes('401')) {
        return new Error('Unauthorized. Please login again.');
      }
      if (error.message.includes('400')) {
        return new Error('Invalid request data.');
      }
      if (error.message.includes('404')) {
        return new Error('Resource not found.');
      }
      if (error.message.includes('500')) {
        return new Error('Server error. Please try again later.');
      }
      return error;
    }
    return new Error('An unexpected error occurred.');
  }
}

export const authService = new AuthService();
export default authService;
