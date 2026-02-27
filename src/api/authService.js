// src/api/authService.js
import axios from "axios";

// ----------------------
// BASE URL
// ----------------------
// Use environment variable from React build
// Must be set in Render frontend environment: REACT_APP_API_BASE_URL=https://shopman-backend-2.onrender.com
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

if (!BASE_URL) {
  console.error("❌ REACT_APP_API_BASE_URL is not set! Login will fail.");
}

// ----------------------
// Axios Client
// ----------------------
const authClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ----------------------
// Login User
// ----------------------
export const loginUser = async (username, password) => {
  const formData = new URLSearchParams();
  formData.append("username", username); // STRICT: do not change case
  formData.append("password", password);

  const response = await authClient.post("/users/token", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const user = response.data;

  // Save token & user
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", user.access_token);

  return user;
};

// ----------------------
// Register User
// ----------------------
export const registerUser = async ({ username, password, roles, admin_password }) => {
  const response = await authClient.post("/users/register/", {
    username,
    password,
    roles, // array of roles
    admin_password,
  });

  return response.data;
};

// ----------------------
// Get Current User
// ----------------------
export const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ----------------------
// Logout
// ----------------------
export const logoutUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

