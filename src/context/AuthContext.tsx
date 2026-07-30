import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthRefreshHandlers } from '../api/axios';
import { User, AuthContextType } from '../types/auth';
import { AxiosError } from 'axios';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Access token stored strictly in React memory state
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  // Function to refresh token silently
  const refreshSession = async (): Promise<string | null> => {
    try {
      const response = await api.post('/api/auth/refresh');
      const newToken = response.data.accessToken;
      setAccessToken(newToken);
      return newToken;
    } catch {
      setAccessToken(null);
      setUser(null);
      return null;
    }
  };

  // Register Axios response interceptor handlers for 401 refresh
  useEffect(() => {
    setAuthRefreshHandlers(
      refreshSession,
      () => {
        setAccessToken(null);
        setUser(null);
      }
    );
  }, []);

  // Silent authentication on initial app load (checks for HTTP-only refresh cookie)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await api.post('/api/auth/refresh');
        const newToken = response.data.accessToken;
        setAccessToken(newToken);

        // Fetch user details using the newly acquired access token
        const userRes = await api.get('/api/user/me', {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });
        setUser(userRes.data.user);
      } catch {
        // No active refresh token cookie or token expired/invalid
        setAccessToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Login Flow:
   * 1. Calls POST /api/auth/login with credentials
   * 2. Saves access token and user info in React memory
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', { email, password });
      
      const { accessToken: newToken, user: userData } = response.data;
      
      setAccessToken(newToken);
      setUser(userData);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Signup Flow:
   * 1. Calls POST /api/auth/signup
   * 2. Resolves successfully to allow page navigation
   */
  const signup = async (name: string, email: string, password: string): Promise<void> => {
    try {
      setError(null);
      await api.post('/api/auth/signup', { name, email, password });
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  /**
   * Logout Flow:
   * 1. Calls POST /api/auth/logout to clear server-side session & HTTP-only cookie
   * 2. Clears in-memory access token and user state
   */
  const logout = async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Proceed with clearing local state regardless of server logout result
    } finally {
      setAccessToken(null);
      setUser(null);
      setError(null);
    }
  };

  const isAuthenticated = Boolean(accessToken && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
