/**
 * Authentication Store
 * Zustand store for auth state management
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User, AuthState } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  refreshTokens: () => Promise<void>;
}

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const response = await authService.login(email, password);

      // Store tokens securely
      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(response.user));

      set({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  loginWithBiometric: async () => {
    try {
      set({ isLoading: true });

      // Get stored credentials
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      if (!token || !userStr) {
        throw new Error('No stored credentials found');
      }

      // Validate token with server
      const isValid = await authService.validateToken(token);

      if (!isValid) {
        // Try to refresh
        await get().refreshTokens();
      } else {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch {
      // Continue with local logout even if API fails
    }

    // Clear stored credentials
    await SecureStore.deleteItemAsync(STORAGE_KEYS.TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true });

      const token = await SecureStore.getItemAsync(STORAGE_KEYS.TOKEN);
      const userStr = await SecureStore.getItemAsync(STORAGE_KEYS.USER);

      if (!token || !userStr) {
        set({ isLoading: false });
        return;
      }

      // Validate token
      const isValid = await authService.validateToken(token);

      if (isValid) {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Try refresh
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          await get().refreshTokens();
        } else {
          await get().logout();
        }
      }
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  },

  refreshTokens: async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

      if (!refreshToken) {
        throw new Error('No refresh token');
      }

      const response = await authService.refreshToken(refreshToken);

      await SecureStore.setItemAsync(STORAGE_KEYS.TOKEN, response.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      set({
        token: response.token,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      await get().logout();
    }
  },
}));
