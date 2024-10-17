import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { uploadImage } from './api/imageApi';
import { postComment } from './api/commentApi';

// Utility function to convert dataURL to Blob
const dataURLtoBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
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
        img.onerror = reject;
        img.src = dataURL;
    });
};

const CommentBox = ({ topic, messages, setMessages, editor, setNewMessage, setShowEditor, setIsCommentPanelOpen }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const quillRef = useRef(null);

    const handleSend = async () => {
        const currentMessage = quillRef.current.getEditor().getContents();
        setLoading(true);

        try {
            if (editor) { //POST Image and Comment
                const dataUrl = await editor.render();
                if (dataUrl) {
                    const blob = dataURLtoBlob(dataUrl);
                    const formData = new FormData();
                    formData.append('file', blob, 'annotated_image.png');

                    const imageResponse = await uploadImage(formData)
                    const thumbnailDataURL = await createThumbnail(dataUrl, 100, 100);

                    const commentDoc = {
                        item: currentMessage,
                        img_id: imageResponse.file_id,
                        thumbnail: thumbnailDataURL,
                    };

                    await postComment(topic, commentDoc)
                    setNewMessage(true);
                    setShowEditor(false);
                    setIsCommentPanelOpen(true);
                }
            } else { //POST Text Comment Only
                if (currentMessage.ops.length === 1 && currentMessage.ops[0].insert.trim() === '') {
                    alert('Comment cannot be empty!');
                    return;
                }
                const textComment = {
                    item: currentMessage,
                };

                await postComment(topic, textComment)
                setNewMessage(true);
            }
        } catch (error) {
            console.error('Error uploading comment:', error);
        } finally {
            setLoading(false);
            setComment('');
        }
    };

    return (
        <>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={comment}
                onChange={setComment}
                style={{ height: '100px', marginTop: '0px' }}
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
