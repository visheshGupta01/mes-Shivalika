// src/api/axiosConfig.js

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000", // Use the environment variable
});

export default api;
