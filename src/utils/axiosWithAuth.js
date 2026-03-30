// src/utils/axiosWithAuth.js
import axios from "axios";

/**
 * ✅ API Base URL
 * Priority:
 * 1. Production (Railway env)
 * 2. Local fallback
 */
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

console.log("🌍 Axios Base URL:", BASE_URL);

/**
 * ✅ Axios factory (OLD PATTERN PRESERVED)
 */
const axiosWithAuth = () => {
  try {
    // ✅ Get user (correct structure from login)
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.access_token;

    // Optional license key
    const licenseKey = localStorage.getItem("license_key");

    const instance = axios.create({
      baseURL: BASE_URL,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(licenseKey ? { "X-License-Key": licenseKey } : {}),
      },
    });

    /**
     * ✅ Request interceptor
     */
    instance.interceptors.request.use(
      (config) => {
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        } else {
          config.headers["Content-Type"] = "application/json";
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    /**
     * ✅ Response interceptor
     */
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          console.error("❌ Network / backend unreachable:", error);
          return Promise.reject({
            message: "Network error. Backend not reachable.",
          });
        }

        // ✅ Auto logout on 401
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

    return instance;
  } catch (err) {
    console.error("❌ Axios setup error:", err);

    // fallback instance (prevents crash → blank page)
    return axios.create({
      baseURL: BASE_URL,
    });
  }
};

export default axiosWithAuth;
