import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

import ReactQuill, { Quill } from 'react-quill-new';

import { postImageComment } from './api/imageApi';
import { postTextComment } from './api/commentApi';

import { Mention } from 'quill-mention';
import 'react-quill-new/node_modules/quill/dist/quill.snow.css';
import 'quill-mention/dist/quill.mention.css';
import MentionBlot from './MentionBlot';
Quill.register({ 'modules/mention': Mention });
Quill.register(MentionBlot);

const CommentBox = ({ topic, messages, setMessages, editor, setNewMessage, setShowEditor, setIsCommentPanelOpen }) => {
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const quillRef = useRef(null);

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

    const userList = [
        { id: 1, value: 'Matt' },
        { id: 2, value: 'Arthur' },
        { id: 3, value: 'Sammy' },
        { id: 4, value: 'Bridget' },
        { id: 5, value: 'Random' },
        { id: 6, value: '274938279' }
    ];
    const hashValues = [
        { id: 3, value: 'TopicA' },
        { id: 4, value: 'TopicB' }
    ];

    return (
        <>
            <ReactQuill
                ref={quillRef}
                theme="snow"
                placeholder='Type your message... use @ to tag users and # to tag artifacts'
                value={comment}
                onChange={setComment}
                style={{ height: '100px', marginTop: '0px' }}
                modules={{
                    mention: {
                        allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
                        mentionDenotationChars: ['@', '#'],
                        onSelect: useCallback((item) => {
                            const quillEditor = quillRef.current.getEditor();
                            const range = quillEditor.getSelection();
                            if (range) {
                                // Check for @ user tag
                                var mentionStart = -1;
                                mentionStart = quillEditor.getText(0, range.index).lastIndexOf('@', range.index);
                                if (mentionStart !== -1) {
                                    quillEditor.deleteText(mentionStart, range.index - mentionStart);
                                    quillEditor.insertEmbed(mentionStart, 'mention', {
                                        id: item.id,
                                        type: "user",
                                        value: item.value
                                    });
                                    quillEditor.setSelection(mentionStart + item.value.length + 2);
                                } else {
                                    // Check for # artifact tag
                                    mentionStart = quillEditor.getText(0, range.index).lastIndexOf('#', range.index);
                                    if (mentionStart !== -1) {
                                        quillEditor.deleteText(mentionStart, range.index - mentionStart);
                                        quillEditor.insertEmbed(mentionStart, 'mention', {
                                            id: item.id,
                                            type: "artifact",
                                            value: item.value
                                        });
                                        quillEditor.setSelection(mentionStart + item.value.length + 2);
                                    }
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
                            let values = mentionChar === '@' ? userList : hashValues;

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
