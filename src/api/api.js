import axios from "axios";

const API_BASE_URL =
  window.apiBaseUrl || `http://${window.location.hostname}:8000`;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 ADD THIS (CRITICAL FIX)
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
