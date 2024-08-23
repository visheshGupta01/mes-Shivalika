// src/api/axiosConfig.js

import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://mes-shivalika-backend.onrender.com", // Use the environment variable
});

export default api;
