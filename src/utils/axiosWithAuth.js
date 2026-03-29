import axios from "axios";

const token = localStorage.getItem("token");
const licenseKey = localStorage.getItem("license_key");

const axiosWithAuth = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
  headers: {
    Authorization: token ? `Bearer ${token}` : "",
    ...(licenseKey ? { "X-License-Key": licenseKey } : {}),
  },
});

axiosWithAuth.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  } else {
    delete config.headers["Content-Type"];
  }
  return config;
});

axiosWithAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject({ message: "Network or backend not reachable" });
    }
    return Promise.reject(error.response.data || { message: "API request failed" });
  }
);

export default axiosWithAuth;
