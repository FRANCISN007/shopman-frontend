// src/api/licenseApi.js
import axios from "axios";

// Use same environment variable as authService
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  console.error("❌ REACT_APP_API_BASE_URL is not set! License API calls will fail.");
}

console.log("🔗 License API Base URL:", BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});
