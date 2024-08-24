// src/api/axiosConfig.js

import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const api = axios.create({
  baseURL:
   apiUrl, // Use the environment variable
});

export default api;
