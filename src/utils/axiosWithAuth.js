// src/utils/axiosWithAuth.js
import axios from "axios";

/**
 * ✅ API Base URL
 * Priority:
 * 1. Production (Railway) → REACT_APP_API_BASE_URL
 * 2. Local fallback
 */
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

console.log("🌍 Axios Base URL:", BASE_URL);

/**
 * ✅ Create a reusable axios instance
 */
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

/**
 * ✅ Request Interceptor
 * - Inject token dynamically (always fresh)
 * - Handle Content-Type correctly
 */
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      // Get stored user (contains token)
      const user = JSON.parse(localStorage.getItem("user"));
      const token = user?.access_token;

      const licenseKey = localStorage.getItem("license_key");

      // Attach Authorization header
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }

      // Attach license key if available
      if (licenseKey) {
        config.headers["X-License-Key"] = licenseKey;
      }

      // Handle Content-Type
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      } else {
        config.headers["Content-Type"] = "application/json";
      }

      return config;
    } catch (err) {
      console.error("❌ Request setup error:", err);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

/**
 * ✅ Response Interceptor
 * - Handles network errors
 * - Handles 401 (auto logout)
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error("❌ Network / backend unreachable:", error);
      return Promise.reject({
        message: "Network error. Backend not reachable.",
      });
    }

    // Auto logout on unauthorized
    if (error.response.status === 401) {
      console.warn("⚠️ Unauthorized - logging out");

      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(
      error.response.data || { message: "API request failed" }
    );
  }
);

export default axiosInstance;
