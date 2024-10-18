import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { uploadImage } from './api/imageApi';
import { postComment } from './api/commentApi';

import ReactQuill, { Quill } from 'react-quill-new';
import { Mention } from 'quill-mention';
import 'react-quill-new/node_modules/quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';

Quill.register({ 'modules/mention': Mention });
const Embed = Quill.import('blots/embed');

// Custom MentionBlot for handling mentions
class MentionBlot extends Embed {
  static create(value) {
    const node = super.create();
    node.setAttribute('data-id', value.id);
    node.innerHTML = `${value.value}`;
    node.classList.add('mention-default'); // Add default formatting class
    node.style.backgroundColor = 'green'; // Set background color to green
    node.style.color = 'white'; // Set text color to white
    return node;
  }

  static formats(node) {
    return node.classList.contains('mention-default') ? 'mention-default' : null;
  }

  static value(node) {
    return {
      id: node.getAttribute('data-id'),
      value: node.innerText.slice(1)
    };
  }
}

MentionBlot.blotName = 'mention';
MentionBlot.tagName = 'span';
MentionBlot.className = 'mention';

Quill.register(MentionBlot);

// Utility function to convert dataURL to Blob
const dataURLtoBlob = (dataURL) => {
  try {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  } catch (error) {
    console.error('Error converting dataURL to Blob:', error);
    return null;
  }
};

// Utility function to create a thumbnail
const createThumbnail = (dataURL, width = 50, height = 50) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = (error) => {
      console.error('Error creating thumbnail:', error);
      reject(error);
    };
    img.src = dataURL;
  });
};

// Helper function to post an image comment
const postImageComment = async (editor, currentMessage, topic, setNewMessage, setShowEditor, setIsCommentPanelOpen) => {
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

// Helper function to post a text comment
const postTextComment = async (currentMessage, topic, setNewMessage) => {
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

const CommentBox = ({ topic, messages, setMessages, editor, setNewMessage, setShowEditor, setIsCommentPanelOpen }) => {
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

  const userList = [
    { id: 1, value: 'alice' },
    { id: 2, value: 'bob' },
    { id: 3, value: 'charlie' },
    { id: 4, value: 'david' },
    { id: 5, value: 'emma' },
  ]; // Example list of users

  // Handle sending the comment
  const handleSend = async () => {
    const currentMessage = quillRef.current.getEditor().getContents();
    setLoading(true);

    try {
      if (editor) {
        await postImageComment(editor, currentMessage, topic, setNewMessage, setShowEditor, setIsCommentPanelOpen);
      } else {
        await postTextComment(currentMessage, topic, setNewMessage);
      }
    } catch (error) {
      console.error('Error uploading comment:', error);
    } finally {
      setLoading(false);
      setComment('');
    }
  };

  const atValues = [
    { id: 1, value: 'Fredrik Sundqvist' },
    { id: 2, value: 'Patrik Sjölin' }
  ];
  const hashValues = [
    { id: 3, value: 'Fredrik Sundqvist 2' },
    { id: 4, value: 'Patrik Sjölin 2' }
  ];

  return (
    <>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={comment}
        onChange={setComment}
        style={{ height: '100px', marginTop: '0px' }}
        modules={{
          mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ['@', '#'],
            onSelect: useCallback((item) => {
              console.log(item); // Will have the added suggestion/Tag
              const quillEditor = quillRef.current.getEditor();
              const range = quillEditor.getSelection();
              if (range) {
                const mentionStart = quillEditor.getText(0, range.index).lastIndexOf('@', range.index);
                if (mentionStart !== -1) {
                  quillEditor.deleteText(mentionStart, range.index - mentionStart);
                  quillEditor.insertEmbed(mentionStart, 'mention', {
                    id: item.id,
                    value: item.value
                  });
                  quillEditor.setSelection(mentionStart + item.value.length + 2);
                }
                console.log(quillEditor.getContents());
              }
              setTimeout(() => {
                const mentionList = document.querySelector('.ql-mention-list');
                if (mentionList) {
                  mentionList.style.display = 'none';
                }
              }, 0);
            }, []),
            source: useCallback((searchTerm, renderList, mentionChar) => {
              let values = mentionChar === '@' ? atValues : hashValues;

              if (searchTerm.length === 0) {
                renderList(values, searchTerm);
              } else {
                const matches = values.filter((value) =>
                  value.value.toLowerCase().includes(searchTerm.toLowerCase())
                );
                renderList(matches, searchTerm);
              }
            }, []),
          }
        }}
      />
      <Button
        variant="contained"
        color="primary"
        endIcon={<SendIcon />}
        onClick={handleSend}
        disabled={loading}
        style={{ marginTop: '40px' }}
        fullWidth
      >
        {loading ? 'Sending...' : 'Post Comment'}
      </Button>
    </>
  );
};

export default CommentBox;
