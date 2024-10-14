// src/components/CommentPanel.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Drawer, Button, IconButton, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { Modal, Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

import CommentBox from './CommentBox';

const QuillCommentBubble = ({ delta, thumbnailUrl, imageId, text }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(true);

  const chatBubbleStyle = {
    backgroundColor: '#f0f0f0',
    borderRadius: '20px',
    padding: '10px',
    maxWidth: '80%',
    margin: '10px 0',
    position: 'relative',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
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

  // useEffect(() => {
  //   if (quillRef.current) {
  //     const quillEditor = quillRef.current.getEditor(); // Access the Quill editor instance

  //     // Set the contents of the editor to the provided delta
  //     quillEditor.setContents(delta);

  //     // Disable the editor to make it read-only
  //     quillEditor.disable();
  //   }
  // }, [delta]);

  // useEffect(() => {
  //   if (quillRef.current) {
  //     const quillEditor = quillRef.current.getEditor(); // Access the Quill editor instance

  //     // Set the contents of the editor to the provided delta
  //     quillEditor.setContents(text);

  //     // Disable the editor to make it read-only
  //     quillEditor.disable();
  //   }
  // }, [text]);

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
    <div style={chatBubbleStyle}>
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
            {/* Conditionally render the IconButton only when loading is false */}
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



const CommentPanel = ({ open, onClose, topic, messages, setMessages, newMessage, setNewMessage }) => {
  const [comment, setComment] = useState([]);
  const [loading, setLoading] = useState(false);
  // const [messages, setMessages] = useState([]);

  const quillRef = useRef(null); // Create a reference to access Quill's methods

  useEffect(() => {
    fetch(`http://localhost:8001/comment/${topic}`, {
      method: 'GET'
    }).then(response => response.json())
      .then((data) => {
        setMessages(data)
        setNewMessage(false)
      });
  }, [])

  useEffect(() => {
    if (newMessage) {
      fetch(`http://localhost:8001/comment/${topic}`, {
        method: 'GET'
      }).then(response => response.json())
        .then((data) => {
          setMessages(data)
          setNewMessage(false)
        });
    }
  }, [newMessage])


  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose}>
        <div style={{ maxWidth: 1000, padding: 20 }}>
          <Typography variant="h6">Comment List: {topic}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
          {messages.map((message, index) => (
            <QuillCommentBubble key={index}
              thumbnailUrl={message.thumbnail}
              imageId={message.img_id}
              text={message.item}
            />
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          </div>
          <CommentBox topic={topic} messages={messages} setMessages={setMessages} setNewMessage={setNewMessage} />
        </div>
      </Drawer>
    </>
  );
};

export default CommentPanel;
