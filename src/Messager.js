import React, { useState } from 'react';
import { Button } from '@mui/material';
import CommentPanel from './CommentPanel';
import * as markerjs2 from 'markerjs2';
import MarkupImage from './MarkupImage';

const Messenger = ({ post }) => {
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  // const [messages, setMessages] = useState(["SAMMY4EVER", "JSKLDF"]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(false);

  const handleOpenCommentPanel = () => {
    setIsCommentPanelOpen(true);
  };

  const handleCloseCommentPanel = () => {
    setIsCommentPanelOpen(false);
  };

  const addMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const topic = "Sammy3"

  return (
    <div>
      <Button variant="outlined" onClick={handleOpenCommentPanel} sx={{ marginTop: '20px' }}>
        Open Comments
      </Button>
      <div>space</div>
      <CommentPanel
        open={isCommentPanelOpen}
        onClose={handleCloseCommentPanel}
        topic={topic}
        messages={messages}
        setMessages={setMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
      <MarkupImage
        imgUrl={"/SammyTest.jpg"}
        topic={topic}
        messages={messages}
        setMessages={setMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />
    </div>
  );
};

export default Messenger;