const getBaseUrl = () => {
  // Production backend URL (set in Render environment variables)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // Local development fallback
  return "http://127.0.0.1:8000";
};

export default getBaseUrl;
