// src/api/commentApi.js
import { imageApi } from "./axiosConfig";
import { postComment } from "./commentApi";
import { dataURLtoBlob, createThumbnail } from "../images/utils";

// Function to upload an image
export const uploadImage = async (formData) => {
  const response = await imageApi.post('/image/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data', // For file uploads
    },
  });
  return response.data;
};

// Helper function to post an image comment
export const postImageComment = async (editor, currentMessage, topic, setNewMessage, setShowEditor, setIsCommentPanelOpen) => {
  try {
    const dataUrl = await editor.render();
    if (dataUrl) {
      const blob = dataURLtoBlob(dataUrl);
      if (!blob) {
        throw new Error('Failed to create Blob from dataURL');
      }

      const formData = new FormData();
      formData.append('file', blob, 'annotated_image.png');

      const imageResponse = await uploadImage(formData);
      const thumbnailDataURL = await createThumbnail(dataUrl, 100, 100);

      const commentDoc = {
        item: currentMessage,
        img_id: imageResponse.file_id,
        thumbnail: thumbnailDataURL,
      };

      await postComment(topic, commentDoc);
      setNewMessage(true);
      setShowEditor(false);
      setIsCommentPanelOpen(true);
    }
  } catch (error) {
    console.error('Error posting image comment:', error);
  }
};