import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, FormControl, InputLabel, Box, FormGroup, FormControlLabel, Checkbox, Select, MenuItem, Drawer, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CommentPanel from './CommentPanel';
import MarkupImage from './MarkupImage';

export default function Workspace({ post }) {
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState(false);
  const [selectedImages, setSelectedImages] = useState(['/SammyTest.jpg']); // Default selected image
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [relationships, setRelationships] = useState({ requirements: [], analyses: [] });

  // useEffect(() => {
  //   axios.get('/api/v1/relationships')
  //     .then(response => {
  //       setRelationships(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching relationships:', error);
  //     });
  // }, []);

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
        height: '50vh',
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

      {/* <Drawer
        sx={{ width: 400, flexShrink: 0 }}
        variant="permanent"
        anchor="right"
        PaperProps={{ style: { width: 400 } }}
      >
        <Box sx={{ width: 400 }}>
          <h3>Drawer Content</h3>
          <p>Additional controls or information can go here.</p>
        </Box>
        <Accordion sx={{ width: 400, marginTop: 'auto' }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <p>Requirements</p>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Requirement</TableCell>
                    <TableCell>Mapped ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relationships.requirements.map((req, index) => (
                    <TableRow key={index}>
                      <TableCell>{req.name}</TableCell>
                      <TableCell>{req.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
        <Accordion sx={{ width: 400 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel2a-content"
            id="panel2a-header"
          >
            <p>Analyses</p>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Analysis Document</TableCell>
                    <TableCell>Mapped ID</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {relationships.analyses.map((analysis, index) => (
                    <TableRow key={index}>
                      <TableCell>{analysis.name}</TableCell>
                      <TableCell>{analysis.id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Drawer> */}
    </div>
  );
};
