// src/api/commentApi.js
import { commentApi } from "./axiosConfig";

// Function to post a comment with an image
export const getComment = async (topic) => {
  const response = await commentApi.get(`/comment/${topic}`);
  return response.data;
};

// Function to post a comment with an image
export const postComment = async (topic, commentDoc) => {
  const response = await commentApi.post(`/comment/${topic}`, commentDoc);
  return response.data;
};
