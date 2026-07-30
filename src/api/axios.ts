import axios from 'axios';

/**
 * Axios instance configured with default settings for API communication.
 * credentials: true ensures HTTP-only cookies (like refresh tokens) are sent automatically.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let tokenRefresher: (() => Promise<string | null>) | null = null;
let onAuthFailed: (() => void) | null = null;

/**
 * Registers handlers from AuthContext to allow the Axios interceptor to trigger
 * token refresh and handle authentication failure.
 */
export const setAuthRefreshHandlers = (
  refresher: () => Promise<string | null>,
  failedHandler: () => void
) => {
  tokenRefresher = refresher;
  onAuthFailed = failedHandler;
};

// Response Interceptor for automatic 401 token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Do not intercept non-existent configs or retry requests or auth endpoints to avoid infinite loops
    if (
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/auth/refresh') ||
      originalRequest.url?.includes('/api/auth/login') ||
      originalRequest.url?.includes('/api/auth/signup')
    ) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && tokenRefresher) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await tokenRefresher();
        if (newAccessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        if (onAuthFailed) {
          onAuthFailed();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
