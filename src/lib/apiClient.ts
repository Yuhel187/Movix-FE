/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
const isServer = typeof window === 'undefined';

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const api = axios.create({
  baseURL: isServer
    ? process.env.API_URL
    : process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
// api.interceptors.request.use(
//   (config) => {
//     if (typeof window !== 'undefined') {
//       const token = localStorage.getItem('accessToken');
//       if (token) {
//         config.headers['Authorization'] = `Bearer ${token}`;
//       }
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   },
// );

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (originalRequest.url?.includes('/auth/refresh-token')) {
        return Promise.reject(error);
    }
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({resolve, reject});
        }).then(function() {
          return api(originalRequest);
        }).catch(function(err) {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh-token');
        processQueue(null, null);
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        if (refreshError.response && refreshError.response.data) {
            refreshError.response.data.message = "Vui lòng đăng nhập để sử dụng chức năng này";
        }
        // Nếu refresh token thất bại (hết hạn hoặc không hợp lệ), clear storage và redirect login
        if (typeof window !== 'undefined') {
             localStorage.removeItem('user_cache');
             // Optional: window.location.href = '/login'; // Uncomment nếu muốn redirect cứng
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;