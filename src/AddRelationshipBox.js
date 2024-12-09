import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button } from '@mui/material';
import Select from 'react-select';
import axios from 'axios';

const AddRelationshipBox = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [sourceNodeType, setSourceNodeType] = useState(null);
    const [sourceNodeName, setSourceNodeName] = useState(null);
    const [targetNodeType, setTargetNodeType] = useState(null);
    const [targetNodeName, setTargetNodeName] = useState(null);
    const [relationshipType, setRelationshipType] = useState(null);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const handleOpenDialog = () => setDialogOpen(true);
    const handleCloseDialog = () => {
        setDialogOpen(false);
        setSourceNodeType(null);
        setSourceNodeName(null);
        setTargetNodeType(null);
        setTargetNodeName(null);
        setRelationshipType(null);
        setIsButtonDisabled(true);
    };

    const handleSelectChange = () => {
        if (sourceNodeType && sourceNodeName && targetNodeType && targetNodeName && relationshipType) {
            setIsButtonDisabled(false);
        } else {
            setIsButtonDisabled(true);
        }
    };

    const handleCreateRelationship = async () => {
        const payload = {
            source_node_label: sourceNodeType.value,
            source_node_name: sourceNodeName.value,
            target_node_label: targetNodeType.value,
            target_node_name: targetNodeName.value,
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

    const sourceNodeOptions = [
        {
            label: 'Requirement_Specification', value: 'Requirement_Specification',
            options2: [
                { label: 'Spec A1', value: 'Spec A1' },
                { label: 'Spec A2', value: 'Spec A2' },
                { label: 'Spec A3', value: 'Spec A3' },
                { label: 'Spec A4', value: 'Spec A4' },
                { label: 'Spec A5', value: 'Spec A5' },
            ],
        },
        {
            label: 'Test_Plan', value: 'Test_Plan',
            options2: [
                { label: 'Test Plan B1', value: 'Test Plan B1' },
                { label: 'Test Plan B2', value: 'Test Plan B2' },
            ],
        },
        {
            label: 'Activity_Diagram', value: 'Activity_Diagram',
            options2: [
                { label: 'Diagram ABC', value: 'Diagram ABC' },
                { label: 'Diagram ABCD', value: 'Diagram ABCD' },
            ],
        },
    ];

    const targetNodeOptions = [
        {
            label: 'Requirement_Specification', value: 'Requirement_Specification',
            options2: [
                { label: 'Spec A1', value: 'Spec A1' },
                { label: 'Spec A2', value: 'Spec A2' },
                { label: 'Spec A3', value: 'Spec A3' },
                { label: 'Spec A4', value: 'Spec A4' },
                { label: 'Spec A5', value: 'Spec A5' },
            ],
        },
        {
            label: 'Test_Plan', value: 'Test_Plan',
            options2: [
                { label: 'Test Plan B1', value: 'Test Plan B1' },
                { label: 'Test Plan B2', value: 'Test Plan B2' },
            ],
        },
        {
            label: 'Activity_Diagram', value: 'Activity_Diagram',
            options2: [
                { label: 'Diagram ABC', value: 'Diagram ABC' },
                { label: 'Diagram ABCD', value: 'Diagram ABCD' },
            ],
        },
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
            textAlign: 'left'
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
                }}>
                    <DialogTitle>Add Relationship</DialogTitle>
                    <DialogContent>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span>
                                <div style={{ width: '270px', position: 'relative', top: '24px',  textAlign: 'center'}}>
                                    <label >Source</label>
                                    <Select
                                        options={sourceNodeOptions}
                                        value={sourceNodeType}
                                        onChange={(selected) => {
                                            setSourceNodeType(selected);
                                            setSourceNodeName(null);
                                            handleSelectChange();
                                        }}
                                        styles={customNodeSelectStyles}
                                        menuPortalTarget={document.body}
                                        placeholder="Label"
                                    />
                                </div>
                                <div style={{ width: '270px', position: 'relative', top: '22px' }}>
                                    {/* <label>Source Node Name</label> */}
                                    <Select
                                        options={sourceNodeType ? sourceNodeType.options2 : []}
                                        value={sourceNodeName}
                                        onChange={(selected) => {
                                            setSourceNodeName(selected);
                                            handleSelectChange();
                                        }}
                                        styles={customNodeSelectStyles}
                                        isDisabled={!sourceNodeType}
                                        menuPortalTarget={document.body}
                                        placeholder="Name"
                                    />
                                </div>
                            </span>
                            <div style={{ width: '240px', textAlign: 'center', position: 'relative', top: '22px' }}>
                                {/* <label>Relationship Type</label> */}
                                <Select
                                    options={relationshipOptions}
                                    value={relationshipType}
                                    onChange={(selected) => {
                                        if (sourceNodeType && sourceNodeName && targetNodeType && targetNodeName) {
                                            setRelationshipType(selected);
                                            handleSelectChange();
                                        }
                                    }}
                                    styles={customRelationshipSelectStyles}
                                    isDisabled={!sourceNodeType || !sourceNodeName || !targetNodeType || !targetNodeName}
                                    menuPortalTarget={document.body}
                                    placeholder="Relationship Type"
                                />
                            </div>
                            <span>
                                <div style={{ width: '270px', position: 'relative', top: '24px',  textAlign: 'center' }}>
                                    <label>Target</label>
                                    <Select
                                        options={targetNodeOptions}
                                        value={targetNodeType}
                                        onChange={(selected) => {
                                            setTargetNodeType(selected);
                                            setTargetNodeName(null);
                                            handleSelectChange();
                                        }}
                                        styles={customNodeSelectStyles}
                                        isDisabled={!sourceNodeType}
                                        menuPortalTarget={document.body}
                                        placeholder="Label"
                                    />
                                </div>
                                <div style={{ width: '270px', position: 'relative', top: '22px' }}>
                                    {/* <label>Target Node Name</label> */}
                                    <Select
                                        options={targetNodeType ? targetNodeType.options2 : []}
                                        value={targetNodeName}
                                        onChange={(selected) => {
                                            setTargetNodeName(selected);
                                            handleSelectChange();
                                        }}
                                        styles={customNodeSelectStyles}
                                        isDisabled={!targetNodeType}
                                        menuPortalTarget={document.body}
                                        placeholder="Name"
                                    />
                                </div>
                            </span>
                        </div>
                        <div style={{ marginTop: '2rem', top: '-30px', position: 'relative', width: '412px', height: '2px', backgroundColor: 'black', marginLeft: 'auto', marginRight: 'auto' }}>
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