import React, { useEffect, useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const ArtifactAccordion = ({ label, rules }) => {
    const [expanded, setExpanded] = useState(false);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [editingRow, setEditingRow] = useState(null); // Track the currently edited row
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newRowPending, setNewRowPending] = useState(false);

    // Get the allowed properties for this Label from the Rules
    const getAllowedPropertiesFromRules = () => {
        var allowedProperties = [];
        if (rules) {
            allowedProperties = rules.allowed_properties;
        } else {
            console.error(`Label "${label}" not found.`);
        }
        return allowedProperties;
    };

    // When accordion is expanded, fetch all Nodes for that Label
    const fetchArtifacts = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8002/graph/nodes/${label}`);
            const artifacts = response.data;

            // Get the allowed properties for this Label from the Rules
            var allowedProperties = getAllowedPropertiesFromRules();
            console.log("allowedProperties:\n" + allowedProperties);

            // Create the columns Object for datagrid (only column types allowed are the allowed properties for the node's Label type)
            const newColumns = allowedProperties.map((property) => ({
                field: property,
                headerName: property.charAt(0).toUpperCase() + property.slice(1), // Capitalize the first letter
                width: 150,
                editable: true,
            }));

            // Create the rows Object for datagrid (keys must match the column fields above)
            //   this just renames the uuid field to id, because the datagrid object requires that field name for unique rows
            const newRows = artifacts.map((item) => {
                const { uuid, ...rest } = item;
                return { id: uuid, ...rest };
            });

            // Set the rows and columns state variables
            setRows(newRows);
            setColumns(newColumns);
        } catch (error) {
            console.error('Error fetching documents:', error);
        }
    };

    // Add a new row to the table, using the same column names that are already in this table, except:
    //   id: make up a number. We won't have the uuid until this is POSTed to the API, because the backend service creates the uuid
    const handleAddRow = () => {
        var allowedProperties = getAllowedPropertiesFromRules();
        setRows((prevRows) => {
            const newRow = {};
            allowedProperties.forEach((key) => {
                newRow[key] = "";
            });

            newRow.id = 31415926535;
            newRow.isNew = true;

            console.log("NEW ROW:\n", newRow);

            // Correctly return a new array by appending newRow
            return [...prevRows, newRow];
        });
        setNewRowPending(true);
    };

    // const handleSaveNewRow = async () => {
    //     const newRow = rows.find((row) => row.id === 31415926535 && row.isNew);

    //     // Don't submit if the newRow isn't found or if it's name field is empty
    //     console.log("NEWROW: \n" + newRow.name)
    //     if (!newRow || !newRow.name) {
    //         console.log("ERROR: new row needs name");
    //     } else {
    //         try {
    //             const postBody = {};
    //             Object.keys(newRow).forEach((key) => {
    //                 if (key !== 'isNew' && key !== 'isUpdated' && key !== 'id' && key !== 'uuid') {
    //                     postBody[key] = newRow[key];
    //                 }
    //             });
    //             await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${newRow.name}`, postBody);
    //             reset();
    //             fetchArtifacts(); // Refresh document list for the label
    //         } catch (error) {
    //             console.error('Error submitting new row:', error);
    //         }
    //     }
    // };

    const handleSaveNewRow = async () => {
        // Don't submit if the newRow isn't found or if it's name field is empty
        console.log("NEWROW: \n" + editingRow.name)
        if (!editingRow || !editingRow.name) {
            console.log("ERROR: new row needs name");
        } else {
            try {
                const postBody = {};
                Object.keys(editingRow).forEach((key) => {
                    if (key !== 'isNew' && key !== 'isUpdated' && key !== 'id' && key !== 'uuid') {
                        postBody[key] = editingRow[key];
                    }
                });
                await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${editingRow.name}`, postBody);
                reset();
                fetchArtifacts(); // Refresh document list for the label
            } catch (error) {
                console.error('Error submitting new row:', error);
            }
        }
    };

    // Function to remove the new row before submitting it
    const handleCancelNewRow = () => {
        setRows((prevRows) => {
            // Filter out the row with id = 31415926535
            const updatedRows = prevRows.filter((row) => row.id !== 31415926535);

            // Return the updated rows array
            return updatedRows;
        });
        reset();
    };

    const handleSaveUpdatedRow = async () => {
        // const updatedRow = rows.find((row) => row.id === id && row.isUpdated);
        if (editingRow) {
            try {
                const postBody = {};
                Object.keys(editingRow).forEach((key) => {
                    if (key !== 'isNew' && key !== 'isUpdated' && key !== 'id' && key !== 'uuid') {
                        postBody[key] = editingRow[key];
                    }
                });
                await axios.patch(`http://127.0.0.1:8002/graph/node/${label}/${editingRow.name}`, postBody);
                reset();
                fetchArtifacts(); // Refresh document list for the label
            } catch (error) {
                console.error('Error updating row:', error);
            }
        }
    };

    const processRowUpdate = (latestEditedRow) => {
        console.log("latestEditedRow: \n" + latestEditedRow.id)

        // We already started editing a row, now we're editing another row that's not that one
        console.log("EDITINGROW: \n" + editingRow)
        if (editingRow && editingRow.id !== latestEditedRow.id) {
            setDialogOpen(true);
            return editingRow; // Prevent switching until user confirms
        }

        setEditingRow(latestEditedRow);
        return latestEditedRow
    };

    const handleProcessRowUpdateError = (error) => {
        console.error('Error processing row update:', error);
    };

    const handleDiscardRowChanges = () => {
        reset();
        fetchArtifacts(); // Refresh document list for the label
    };

    const reset = () => {
        setEditingRow(null);
        setNewRowPending(false);
        setDialogOpen(false);
    }

    return (
        <div>
            <Accordion
                style={{ width: '80%' }}
                key={label}
                expanded={expanded}
                onChange={() => {
                    setExpanded(!expanded);
                    if (rows.length === 0) {
                        fetchArtifacts();
                    }
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    {label}
                </AccordionSummary>
                <AccordionDetails>
                    {rows.length > 0 && (
                        <>
                            {!newRowPending && !editingRow ? (
                                <Button
                                    variant="contained"
                                    onClick={() => handleAddRow()}
                                    style={{ marginBottom: '20px' }}
                                >
                                    Add Row
                                </Button>
                            ) : newRowPending && editingRow ? (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSaveNewRow()}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        Save Row
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleDiscardRowChanges()}
                                        style={{ marginBottom: '20px', marginLeft: '5px' }}
                                    >
                                        Discard New Row
                                    </Button>
                                </>
                            ) : !newRowPending && editingRow ? (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSaveUpdatedRow()}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        Save Row
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleDiscardRowChanges()}
                                        style={{ marginBottom: '20px', marginLeft: '5px' }}
                                    >
                                        Discard Edits
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCancelNewRow()}
                                        style={{ marginBottom: '20px', marginLeft: '5px' }}
                                    >
                                        Cancel
                                    </Button>
                                </>
                            )}
                            <div style={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    pageSize={5}
                                    rowsPerPageOptions={[5]}
                                    processRowUpdate={(row) => processRowUpdate(row)}
                                    onProcessRowUpdateError={handleProcessRowUpdateError}
                                    experimentalFeatures={{ newEditingApi: true }}
                                    getRowClassName={(params) =>
                                        params.row.isNew ? 'new-row' : ''
                                    }
                                    sx={{
                                        "& .new-row": {
                                            border: '2px solid black',
                                            borderRadius: '4px',
                                        },
                                    }}
                                />
                            </div>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Pending Edits Detected</DialogTitle>
                <DialogContent>
                    {editingRow && label ? (
                        <DialogContentText>
                            You are currently editing {label} / {editingRow.name}. Discard or Save current edits before editing another row.
                        </DialogContentText>
                    ) : (
                        <DialogContentText>
                            You are currently editing another row. Discard or Save current edits before editing another row.
                        </DialogContentText>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>
                        OK
                    </Button>
                    {/* <Button onClick={() => handleDiscardRowChanges(false)} color="primary">
                        Yes
                    </Button>
                    <Button onClick={() => handleDiscardRowChanges(true)} color="primary">
                        Discard Changes
                    </Button> */}
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ArtifactAccordion;
