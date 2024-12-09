import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import Select from 'react-select';
import axios from 'axios';

const AddRelationshipBox = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sourceNode, setSourceNode] = useState(null);
    const [targetNode, setTargetNode] = useState(null);
    const [relationshipType, setRelationshipType] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSourceNode(null);
        setTargetNode(null);
        setRelationshipType(null);
        setIsButtonDisabled(true);
    };

    const handleSelectChange = () => {
        if (sourceNode && targetNode && relationshipType) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    };

    const handleCreateRelationship = async () => {
        const payload = {
            source_node_label: sourceNode.label,
            source_node_name: sourceNode.name,
            target_node_label: targetNode.label,
            target_node_name: targetNode.name,
            relationship_type: relationshipType.value,
            properties: {}, // Add properties as needed
        };

        try {
            await axios.post('http://localhost:8002/api/v1/graph/relationship', payload);
            await axios.get('http://localhost:8002/api/v1/graph/visualization');
            handleCloseDialog();
        } catch (error) {
            console.error('Error creating relationship:', error);
        }
    };

    const nodeOptions = [
        { label: 'Node A', name: 'NodeA', value: 'NodeA' },
        { label: 'Node B', name: 'NodeB', value: 'NodeB' },
        // Add more node options as needed
    ];

    const relationshipOptions = [
        { label: 'Relationship 1', value: 'RELATIONSHIP_1' },
        { label: 'Relationship 2', value: 'RELATIONSHIP_2' },
        // Add more relationship options as needed
    ];

    const customNodeSelectStyles = {
        menu: (provided) => ({
            ...provided,
            maxHeight: '600px',
            overflowY: 'auto',
        }),
        control: (provided) => ({
            ...provided,
            border: '2px solid black',
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999, // Ensure the menu appears above other elements
        }),
    };

    const customRelationshipSelectStyles = {
        menu: (provided) => ({
            ...provided,
            maxHeight: '600px',
            overflowY: 'auto',
        }),
        // control: (provided) => ({
        //     ...provided,
        //     border: '2px solid black',
        // }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999, // Ensure the menu appears above other elements
        }),
    };

    return (
        <div>
            <Button variant="contained" onClick={handleOpenDialog} style={{ marginBottom: '1rem' }}>
                Add Relationship
            </Button>

            <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth={false}>
                <div style={{
                    width: '1000px',
                    // height: '800px' 
                }}>
                    <DialogTitle>Add Relationship</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <div style={{ width: '270px', position: 'relative', top: '24px' }}>
                                <label>Source Node</label>
                                <Select
                                    options={nodeOptions}
                                    value={sourceNode}
                                    onChange={(selected) => {
                                        setSourceNode(selected);
                                        handleSelectChange();
                                    }}
                                    styles={customNodeSelectStyles}
                                    menuPortalTarget={document.body}
                                />
                            </div>
                            <div style={{ width: '240px', textAlign: 'center' }}>
                                <label>Relationship Type</label>
                                <Select
                                    options={relationshipOptions}
                                    value={relationshipType}
                                    onChange={(selected) => {
                                        setRelationshipType(selected);
                                        handleSelectChange();
                                    }}
                                    styles={customRelationshipSelectStyles}
                                    menuPortalTarget={document.body}
                                />
                            </div>
                            <div style={{ width: '270px', position: 'relative', top: '24px' }}>
                                <label>Target Node</label>
                                <Select
                                    options={nodeOptions}
                                    value={targetNode}
                                    onChange={(selected) => {
                                        setTargetNode(selected);
                                        handleSelectChange();
                                    }}
                                    styles={customNodeSelectStyles}
                                    menuPortalTarget={document.body}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '2rem', top: '-28px', position: 'relative', width: '412px', height: '2px', backgroundColor: 'black', marginLeft: 'auto', marginRight: 'auto' }}>
                            <div style={{
                                width: '0',
                                height: '0',
                                borderLeft: '10px solid black',
                                borderTop: '5px solid transparent',
                                borderBottom: '5px solid transparent',
                                position: 'absolute',
                                top: '-4px',
                                right: '0',
                            }}></div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateRelationship}
                            disabled={isButtonDisabled}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </div>
    );
};

export default AddRelationshipBox;
