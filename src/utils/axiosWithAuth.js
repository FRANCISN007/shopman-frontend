import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8000",
});

// attach token dynamically
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const licenseKey = localStorage.getItem("license_key");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (licenseKey) {
    config.headers["X-License-Key"] = licenseKey;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!err.response) {
      return Promise.reject({ message: "Network error" });
    }
    return Promise.reject(err.response.data);
  }
);

export default instance;
