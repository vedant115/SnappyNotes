import axios from "axios";

// Determine the base URL based on the environment
const isDevelopment = import.meta.env.MODE === "development";
const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

// In production on the same domain, use relative path
// In development or when accessing from elsewhere, use the full URL
const BASE_URL =
  isDevelopment || isLocalhost ? "http://localhost:5001/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      `Making ${config.method.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This axios instance is configured to use the base URL for the API.
