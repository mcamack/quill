import React, { useState, useRef, useEffect } from 'react';
import * as markerjs2 from 'markerjs2';
import CommentBox from './CommentBox';

// Displays an image and when clicked opens an editor to annotate the image
export default function MarkupImage({ imgUrl, topic, messages, setMessages, newMessage, setNewMessage }) {
    const imgRef = useRef(null); // Reference for the image element
    const [editor, setEditor] = useState(null);
    const [showEditor, setShowEditor] = useState(false);

    // Function to hide the dynamically created element
    function hideSaveAndCloseButton() {
        // Use querySelector to find the element with the specific attributes
        const saveCloseButton = document.querySelector('div[title="Save and close"][aria-label="Save and close"]');

        if (saveCloseButton) {
            // Hide the element by setting display to 'none'
            saveCloseButton.style.display = 'none';
        }
    }

    // Create a MutationObserver to monitor the DOM for the element
    const observer = new MutationObserver((mutationsList, observer) => {
        // Check for the existence of the Save and Close button and hide it if found
        hideSaveAndCloseButton();
    });

    // Start observing the body for added nodes (dynamically created elements)
    observer.observe(document.body, { childList: true, subtree: true });

    // Function to show marker.js editor
    const openMarkerEditor = () => {
        setShowEditor(true)
        if (imgRef.current) {
            const markerArea = new markerjs2.MarkerArea(imgRef.current); // Initialize marker.js on the image
            setEditor(markerArea)

            markerArea.addEventListener('close', (event) => {
                setShowEditor(false)
            });

            markerArea.show(); // Display the marker.js editor
        }
    };

    // Function to show marker.js editor
    const closeMarkerEditor = () => {
        setShowEditor(false)
        if (editor) {
            editor.close()
        }
    };

    useEffect(() => {
        if (!showEditor) {
            closeMarkerEditor()
        }
    }, [showEditor])

    return (
        <>
            <div style={{
                maxWidth: "800px",
                // maxHeight: '100%',
                border: "solid",
                borderColor: "black",
                borderRadius: '5px'
            }}>
                <img
                    ref={imgRef}
                    src={imgUrl}
                    alt="sample"
                    style={{
                        maxWidth: '100%',
                        // maxHeight: '100%',
                        cursor: 'pointer'
                    }}
                    onClick={openMarkerEditor}
                />
                {showEditor &&
                    <CommentBox
                        topic={topic}
                        editor={editor}
                        messages={messages}
                        setMessages={setMessages}
                        setNewMessage={setNewMessage}
                        setShowEditor={setShowEditor}
                    />
                }
            </div>
        </>
    )
}