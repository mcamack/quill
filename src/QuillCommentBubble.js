import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
// import 'react-quill-new/dist/quill.snow.css';
import { Drawer, Button, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Modal, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

export default function QuillCommentBubble({ delta, thumbnailUrl, imageId, text }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatBubbleRef = useRef(null);

  const chatBubbleStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: '20px',
    padding: '10px',
    minWidth: '50px', // Minimum width to ensure the bubble is not too small
    maxWidth: '80%', // Maximum width to prevent the bubble from being too wide
    width: 'fit-content', // Automatically adjusts the width to fit the content
    margin: '10px 0',
    position: 'relative',
    boxShadow: '0 6px 9px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    border: isModalOpen ? '2px solid blue' : 'none', // Add black border when modal is open
  };

  const Thumbnail = styled('img')(({ theme }) => ({
    width: '50px',
    height: '50px',
    marginRight: '10px',
    cursor: 'pointer',
    objectFit: 'cover',
    borderRadius: '10px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  }));

  const modalStyle = {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '80%',
    height: '80%',
    transform: 'translate(0, 0)',
    overflow: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imageContainerStyle = {
    position: 'relative', // Set relative positioning to position the button relative to the image
    display: 'inline-block',
  };

  const closeButtonStyle = {
    position: 'absolute',
    top: '5px',
    right: '5px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    color: 'white',
    zIndex: 2, // Ensure the button is on top
  };

  const quillRef = useRef(null);

  const handleThumbnailClick = () => {
    fetch(`http://localhost:8000/image/${imageId}`, {
      method: 'GET'
    })
      .then(response => response.blob()) // Get the response as a blob (binary data)
      .then((blob) => {
        // Convert blob to base64
        const reader = new FileReader();
        reader.readAsDataURL(blob); // This will encode the blob as base64

        reader.onloadend = () => {
          const base64data = reader.result; // Contains the base64 image data
          setModalImage(base64data); // Use this base64 string in your img src
        };
      })
      .catch((error) => {
        console.error('Error fetching image:', error);
      });
    setIsModalOpen(true); // Open the modal with the full-size image
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  // Function to handle when the image has fully loaded
  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div ref={chatBubbleRef} style={chatBubbleStyle}>
      {thumbnailUrl && (
        <Thumbnail
          src={thumbnailUrl}
          alt="thumbnail"
          onClick={handleThumbnailClick}
        />
      )}
      <ReactQuill
        ref={quillRef}
        readOnly={true}
        value={text}
        theme="bubble" // Use the bubble theme for a compact look
        modules={{ toolbar: false }} // Disable toolbar for read-only view
      />
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          {loading && <CircularProgress />} {/* Show spinner while loading */}
          <div style={imageContainerStyle}>
            {/* Conditionally render the CloseIcon only when loading is false */}
            {!loading && (
              <IconButton sx={closeButtonStyle} onClick={handleCloseModal}>
                <CloseIcon />
              </IconButton>
            )}
            <img
              src={modalImage}
              alt="full-size"
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                display: loading ? 'none' : 'block',
              }}
              onLoad={handleImageLoad}
            />
          </div>
        </Box>
      </Modal>
    </div>
  );
};