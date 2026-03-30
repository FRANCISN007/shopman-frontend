// src/api/authService.js
import axios from "axios";

/**
 * ✅ API Base URL
 * Priority:
 * 1. Railway / Production → REACT_APP_API_BASE_URL
 * 2. Local development → fallback to current host
 */
const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000`;

console.log("🌍 API Base URL:", BASE_URL);

/**
 * ✅ Axios instance
 */
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ✅ Login user
 */
export const loginUser = async (username, password) => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await authClient.post("/users/token", formData, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const user = response.data;

    // Save user (token + info)
    localStorage.setItem("user", JSON.stringify(user));

    return user;
  } catch (error) {
    console.error("❌ Login failed:", error);

    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: "No response from server. Check backend URL." };
    } else {
      throw { message: "Unexpected error occurred during login." };
    }
  }
};

/**
 * ✅ Register user
 */
export const registerUser = async ({
  username,
  password,
  roles,
  admin_password,
}) => {
  try {
    const response = await authClient.post("/users/register/", {
      username,
      password,
      roles,
      admin_password,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Registration failed:", error);

    if (error.response) {
      throw error.response.data;
    } else if (error.request) {
      throw { message: "No response from server. Check backend URL." };
    } else {
      throw { message: "Unexpected error occurred during registration." };
    }
  }
};

/**
 * ✅ Get current user
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error("❌ Error reading user from storage:", err);
    return null;
  }
};

/**
 * ✅ Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem("user");
};
