import React, { useState, useRef, useEffect } from 'react';
import * as markerjs2 from 'markerjs2';
import CommentBox from './CommentBox';
import Draggable from 'react-draggable';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';

// Displays an image and when clicked opens an editor to annotate the image
export default function MarkupImage({ imgUrl, topic, messages, setMessages, newMessage, setNewMessage, setIsCommentPanelOpen }) {
    const imgRef = useRef(null); // Reference for the image element
    const [editor, setEditor] = useState(null);
    const [showEditor, setShowEditor] = useState(false);
    const [size, setSize] = useState({ width: 400, height: 300 }); // Initial size
    const [position, setPosition] = useState({ x: 0, y: 0 }); // Initial position

    // Function to hide the dynamically created element
    function hideSaveAndCloseButton() {
        // Use querySelector to find the element with the specific attributes
        const saveCloseButton = document.querySelector('div[title="Save and close"][aria-label="Save and close"]');

        if (saveCloseButton) {
            // Hide the element by setting display to 'none'
            saveCloseButton.style.display = 'none';
        }
    }

    useEffect(() => {
        // Create a MutationObserver to monitor the DOM for the element
        const observer = new MutationObserver((mutationsList, observer) => {
            // Check for the existence of the Save and Close button and hide it if found
            hideSaveAndCloseButton();
        });

        // Start observing the body for added nodes (dynamically created elements)
        observer.observe(document.body, { childList: true, subtree: true });

        // Cleanup observer on component unmount
        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        if (imgRef.current) {
            // Initialize marker.js on the image only once
            const markerArea = new markerjs2.MarkerArea(imgRef.current);
            setEditor(markerArea);

            markerArea.addEventListener('close', () => {
                setShowEditor(false);
            });
        }
    }, []); // Run only once when component mounts

    // useEffect(() => {
    //     if (imgRef.current) {
    //         if (editor) {
    //             editor.addEventListener('isOpen', () => {
    //                 const editorContainer = document.querySelector('.__markerjs2_ __markerjs2__1_');
    //                 if (editorContainer) {
    //                     // editorContainer.style.position = 'absolute';
    //                     // editorContainer.style.top = '100px';  // Customize to your needs
    //                     // editorContainer.style.left = '200px'; // Customize to your needs
    //                 }
    //             });

    //         }
    //     }
    // }, [position]); // Run only once when component mounts

    // Function to show marker.js editor
    const openMarkerEditor = () => {
        if (editor) {
            setShowEditor(true);

            // Set markerArea position to the current position of the image
            console.log("TARGETROOT")
            const b = document.getElementById('dragImage');
            editor.targetRoot = document.getElementById('dragImage');
            // editor.targetX = position.x;
            // editor.targetY = position.y;

            // editor.style.position = 'absolute';
            // editor.style.top = '100px';  // Set your desired location
            // editor.style.left = '200px'; // Set your desired location

            editor.show(); // Display the marker.js editor
        }
    };

    // Function to close marker.js editor
    const closeMarkerEditor = () => {
        setShowEditor(false);
        if (editor) {
            editor.close();
        }
    };

    useEffect(() => {
        if (!showEditor) {
            closeMarkerEditor();
        }
    }, [showEditor]);

    const handleResize = (e, { size }) => {
        setSize(size);
    };

    const handleDrag = (e, data) => {
        setPosition({ x: data.x, y: data.y });
    };

    const nodeRef = React.useRef(null);

    return (
        <Draggable nodeRef={nodeRef} handle=".drag-handle" bounds="parent" onDrag={handleDrag}>
            <div ref={nodeRef} style={{position: "absolute"}}>
                <Resizable
                    id="dragImage"
                    width={size.width}
                    height={size.height}
                    onResize={handleResize}
                    minConstraints={[100, 75]} // Minimum size constraints
                    maxConstraints={[800, 600]} // Maximum size constraints
                    handle={<span className="react-resizable-handle react-resizable-handle-se" />} // Bottom right handle
                >
                    <div style={{ position: 'absolute', width: size.width, height: size.height }}>
                        <div
                            className="drag-handle"
                            style={{
                                height: '30px',
                                backgroundColor: '#ddd',
                                borderTopLeftRadius: '5px',
                                borderTopRightRadius: '5px',
                                cursor: 'move',
                                textAlign: 'center',
                                lineHeight: '30px',
                                userSelect: 'none'
                            }}
                        >
                            {imgUrl}
                        </div>
                        <img
                            ref={imgRef}
                            src={imgUrl}
                            alt="sample"
                            style={{
                                display: 'block',  // Prevents inline spacing issues
                                width: '100%',
                                height: 'calc(100% - 30px)',
                                cursor: 'pointer',
                                borderBottomLeftRadius: '5px',
                                borderBottomRightRadius: '5px'
                            }}
                            onClick={openMarkerEditor}
                        />
                        {showEditor && (
                            <CommentBox
                                topic={topic}
                                editor={editor}
                                messages={messages}
                                setMessages={setMessages}
                                setNewMessage={setNewMessage}
                                setShowEditor={setShowEditor}
                                setIsCommentPanelOpen={setIsCommentPanelOpen}
                            />
                        )}
                    </div>
                </Resizable>
            </div>
        </Draggable>
    );
}
