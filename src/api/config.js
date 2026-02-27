//const getBaseUrl = () => {
  // Always prefer runtime URL
  //if (typeof window !== "undefined") {
    //return `${window.location.protocol}//${window.location.hostname}:8000`;
  //}

  // Fallback (SSR / tests only)
  //return "http://localhost:8000";
//};

//export default getBaseUrl;


// src/api/config.js

// Use environment variable injected at build time
const getBaseUrl = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;

  if (!BASE_URL) {
    console.error(
      "❌ REACT_APP_API_BASE_URL is not set! All API calls will fail."
    );
    // Optionally fallback to localhost for local development only
    if (process.env.NODE_ENV === "development") {
      return "http://localhost:8000";
    }
  }

  return BASE_URL;
};

export default getBaseUrl;
