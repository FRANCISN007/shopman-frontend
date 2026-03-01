const getBaseUrl = () => {
  // CRA environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // Local development fallback
  return "http://127.0.0.1:8000";
};

export default getBaseUrl;
