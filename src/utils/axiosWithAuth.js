import axios from "axios";

const BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://shopman-backend-production.up.railway.app";

const axiosWithAuth = () => {
  const token =
    JSON.parse(localStorage.getItem("user"))?.access_token ||
    localStorage.getItem("token");

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });
};

export default axiosWithAuth;
