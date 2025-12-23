/**
 * Authentication Service
 * Handles login, logout, and token management
 */

import { apiService } from './api.service';
import { User } from '@/types';

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

interface RefreshResponse {
  token: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', { email, password });
  }

  /**
   * Login with biometric
   */
  async loginWithBiometric(biometricToken: string): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/biometric', { biometricToken });
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<RefreshResponse> {
    return apiService.post<RefreshResponse>('/auth/refresh', { refreshToken });
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      await apiService.get('/auth/validate');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiService.post('/auth/forgot-password', { email });
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiService.post('/auth/reset-password', { token, password });
  }

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    return apiService.post('/auth/change-password', { currentPassword, newPassword });
  }

  /**
   * Update profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    return apiService.patch('/auth/profile', data);
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: any): Promise<{ avatarUrl: string }> {
    return apiService.upload('/auth/avatar', file, 'avatar');
  }
}

export const authService = new AuthService();
