import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://shopman-backend-production.up.railway.app";

const axiosWithAuth = () => {
  let token = null;

  try {
    const user = localStorage.getItem("user");
    token = user ? JSON.parse(user)?.access_token : null;
  } catch (e) {
    token = null;
  }

  if (!token) {
    token = localStorage.getItem("token");
  }

  const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // 🔥 ONLY add Authorization if token exists
  if (token) {
    instance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  return instance;
};

export default axiosWithAuth;
