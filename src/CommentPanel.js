// src/components/CommentPanel.jsx
import React, { useEffect, useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Drawer, Button, IconButton, Typography, Alert, CircularProgress, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import axios from 'axios';
import { Modal, Box } from '@mui/material';
import { styled } from '@mui/system';

import { getComment } from './api/commentApi';

import CommentBox from './CommentBox';
import QuillCommentBubble from './QuillCommentBubble';

const CommentPanel = ({ open, onClose, topic, messages, setMessages, newMessage, setNewMessage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterText, setFilterText] = useState('');
  const drawerRef = useRef(null);

  const scrollToBottom = () => {
    drawerRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  useEffect(() => {
    if (newMessage || open) {
      (async () => {
        setLoading(true);
        try {
          const comments = await getComment(topic);
          setMessages(comments);
          setNewMessage(false);
          setError(null);
        } catch (error) {
          console.error('Error fetching comments:', error);
          setError('Failed to fetch comments. Please try again later.');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [newMessage, open]);

  const handleFilterClick = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilterChange = (event) => {
    setFilterText(event.target.value);
  };

  const filteredMessages = messages.filter((message) =>
    JSON.stringify(message).toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <>
      <Drawer anchor="right" open={open} onClose={onClose} sx={{ width: 420 }}>
        <div style={{ width: 420, padding: 20 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5">{topic}</Typography>
            <Box>
              <IconButton onClick={handleFilterClick} sx={{ mr: 1 }}>
                <FilterListIcon />
              </IconButton>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          {filterOpen && (
            <TextField
              placeholder="Filter comments"
              variant="outlined"
              fullWidth
              value={filterText}
              onChange={handleFilterChange}
              sx={{ mb: 2 }}
            />
          )}
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              <CircularProgress />
            </div>
          )}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {filteredMessages.map((message, index) => (
            <QuillCommentBubble key={index}
              thumbnailUrl={message.thumbnail}
              imageId={message.img_id}
              text={message.item}
            />
          ))}
          <div ref={drawerRef} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          </div>
          <CommentBox topic={topic} messages={messages} setMessages={setMessages} setNewMessage={setNewMessage} />
        </div>
      </Drawer>
    </>
  );
};

export default CommentPanel;
