import React, { useState } from 'react';
import { Button, FormControl, InputLabel, Box, FormGroup, FormControlLabel, Checkbox, Select, MenuItem } from '@mui/material';
import CommentPanel from './CommentPanel';
import MarkupImage from './MarkupImage';

export default function Workspace({ post }) {
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(false);
  const [selectedImages, setSelectedImages] = useState(['/SammyTest.jpg']); // Default selected image
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenCommentPanel = () => {
    setIsCommentPanelOpen(true);
  };

  const handleCloseCommentPanel = () => {
    setIsCommentPanelOpen(false);
  };

  const handleImageChange = (event) => {
    const { value, checked } = event.target;
    setSelectedImages((prevSelectedImages) =>
      checked ? [...prevSelectedImages, value] : prevSelectedImages.filter((img) => img !== value)
    );
  };

  const handleDropdownOpen = () => {
    setIsDropdownOpen(true);
  };

  const handleDropdownClose = () => {
    setIsDropdownOpen(false);
  };

  const topic = "Sammy3";

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        // overflow: 'hidden' // Ensure the draggable cannot overflow outside
      }}>
      <Box>
        <Button variant="outlined" onClick={handleOpenCommentPanel} sx={{ marginTop: '20px' }}>
          Open Comments
        </Button>
      </Box>

      <Box>
        <FormControl sx={{ margin: '20px 0', width: '200px' }}>
          <InputLabel id="image-select-label">Select Images</InputLabel>
          <Select
            labelId="image-select-label"
            id="image-select"
            multiple
            open={isDropdownOpen}
            onClose={handleDropdownClose}
            onOpen={handleDropdownOpen}
            value={selectedImages}
            renderValue={(selected) => selected.join(', ')}
            label="Select Images"
          >
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedImages.includes('/SammyTest.jpg')}
                    onChange={handleImageChange}
                    value="/SammyTest.jpg"
                  />
                }
                label="SammyTest.jpg"
              />
            </MenuItem>
            <MenuItem>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectedImages.includes('/activityDiagram.png')}
                    onChange={handleImageChange}
                    value="/activityDiagram.png"
                  />
                }
                label="activityDiagram.png"
              />
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      <CommentPanel
        open={isCommentPanelOpen}
        onClose={handleCloseCommentPanel}
        topic={selectedImages.length > 0 ? selectedImages[0].split('/').pop() : ''}
        messages={messages}
        setMessages={setMessages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
      />

      {selectedImages.map((imgUrl) => (
        <MarkupImage
          key={imgUrl}
          imgUrl={imgUrl} // Pass the selected image URL to MarkupImage
          topic={imgUrl.split('/').pop()}
          messages={messages}
          setMessages={setMessages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          setIsCommentPanelOpen={setIsCommentPanelOpen}
        />
      ))}
    </div>
  );
};
