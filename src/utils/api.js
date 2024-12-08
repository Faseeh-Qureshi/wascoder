// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Adjust baseURL to your server
});

export default api;
