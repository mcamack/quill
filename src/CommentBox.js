import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { uploadImage } from './api/imageApi';
import { postComment } from './api/commentApi';

// Import and register quill-mention
import ReactQuill, { Quill } from 'react-quill-new';
// import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';

// // import "quill-mention/autoregister";
// import { Mention } from 'quill-mention';
// Quill.register('modules/mention', Mention);

import { Mention, MentionBlot } from "quill-mention";
Quill.register({ "blots/mention": MentionBlot, "modules/mention": Mention });


// ///// quill-mention^4.1.0
// // import 'quill-mention';
// import quillMention from 'quill-mention';
// Quill.register('modules/mention', quillMention);

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

    const userList = [
        { id: 1, value: 'alice' },
        { id: 2, value: 'bob' },
        { id: 3, value: 'charlie' },
        { id: 4, value: 'david' },
        { id: 5, value: 'emma' },
    ]; // Example list of users

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
            } else { //POST Text Comment Only
                if (currentMessage.ops.length === 1 && currentMessage.ops[0].insert.trim() === '') {
                    alert('Comment cannot be empty!');
                    return;
                }
                const textComment = {
                    item: currentMessage,
                };

                await postComment(topic, textComment);
                setNewMessage(true);
            }
        } catch (error) {
            console.error('Error uploading comment:', error);
        } finally {
            setLoading(false);
            setComment('');
        }
    };

    const atValues = [
        { id: 1, value: "Fredrik Sundqvist" },
        { id: 2, value: "Patrik Sjölin" }
    ];
    const hashValues = [
        { id: 3, value: "Fredrik Sundqvist 2" },
        { id: 4, value: "Patrik Sjölin 2" }
    ];

    const modules = {
        mention: {
            allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
            mentionDenotationChars: ["@", "#"],
            source: function (searchTerm, renderList, mentionChar) {
                let values;

                if (mentionChar === "@") {
                    values = atValues;
                } else {
                    values = hashValues;
                }

                if (searchTerm.length === 0) {
                    renderList(values, searchTerm);
                } else {
                    const matches = [];
                    for (let i = 0; i < values.length; i++)
                        if (
                            ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                        )
                            matches.push(values[i]);
                    renderList(matches, searchTerm);
                }
            }
        }
    }

    // Quill.register({ "modules/mention2": Mention });

    const someFunc = (searchTerm, renderList, mentionChar) => {
        let values;

        if (mentionChar === "@") {
            values = atValues;
        } else {
            values = hashValues;
        }

        if (searchTerm.length === 0) {
            renderList(values, searchTerm);
        } else {
            const matches = [];
            for (let i = 0; i < values.length; i++)
                if (
                    ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                )
                    matches.push(values[i]);
            renderList(matches, searchTerm);
        }
    }

    return (
        <>
            <ReactQuill
                ref={quillRef}
                // theme="snow"
                value={comment}
                onChange={setComment}
                style={{ height: '100px', marginTop: '0px' }}
                // modules={{modules}}
                modules={{
                    mention: {
                        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                        mentionDenotationChars: ["@", "#"],
                        onSelect: useCallback((item, insertItem) => {
                            console.log(item);//Will have the added suggestion/Tag
                            const quillEditor = quillRef.current.getEditor();
                            const range = quillEditor.getSelection();
                            if (range) {
                                quillEditor.insertText(range.index, `${item.value} `, 'user');
                                quillEditor.setSelection(range.index + item.value.length + 2);
                            }
                            setTimeout(() => {
                                const mentionList = document.querySelector('.ql-mention-list');
                                if (mentionList) {
                                    mentionList.style.display = 'none';
                                }
                            }, 0);
                        }, []),
                        source: useCallback((searchTerm, renderList, mentionChar) => {
                            let values;

                            if (mentionChar === "@") {
                                values = atValues;
                            } else {
                                values = hashValues;
                            }

                            if (searchTerm.length === 0) {
                                renderList(values, searchTerm);
                            } else {
                                const matches = [];
                                for (let i = 0; i < values.length; i++)
                                    if (
                                        ~values[i].value.toLowerCase().indexOf(searchTerm.toLowerCase())
                                    )
                                        matches.push(values[i]);
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
