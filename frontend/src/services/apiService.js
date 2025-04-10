import axios from "axios";

// Create an Axios instance with default settings
const API = axios.create({
  baseURL: import.meta.env.VITE_BASEURL, // Replace with your backend URL
  headers: {
    "Content-Type": "application/json", // Default header for JSON data
  }
});

// Interceptor to add the JWT token to the request header
API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`; // Attach the token if available
    }
    return req; // Proceed with the request
  },
  (error) => {
    return Promise.reject(error); // Handle request error
  }
);
export {API}