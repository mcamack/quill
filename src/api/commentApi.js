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

// Helper function to post a text comment
export const postTextComment = async (currentMessage, topic, setNewMessage) => {
  try {
    if (currentMessage.ops.length === 1 && currentMessage.ops[0].insert.trim() === '') {
      alert('Comment cannot be empty!');
      return;
    }
    const textComment = {
      item: currentMessage,
    };

    await postComment(topic, textComment);
    setNewMessage(true);
  } catch (error) {
    console.error('Error posting text comment:', error);
  }
};