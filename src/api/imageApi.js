// src/api/commentApi.js
import { imageApi } from "./axiosConfig";

// Function to upload an image
export const uploadImage = async (formData) => {
  const response = await imageApi.post('/image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // For file uploads
    },
  });
  return response.data;
};