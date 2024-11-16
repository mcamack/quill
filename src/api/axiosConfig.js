// src/api/axiosConfig.js
import axios from 'axios';

export const imageApi = axios.create({
  baseURL: 'http://localhost:8000', // Base URL for your API
  timeout: 10000, // Timeout after 10 seconds
  headers: {
    'Content-Type': 'application/json', // Default content type
  },
});

export const commentApi = axios.create({
    baseURL: 'http://localhost:8001', // Base URL for your API
    timeout: 10000, // Timeout after 5 seconds
    headers: {
      'Content-Type': 'application/json', // Default content type
    },
  });
