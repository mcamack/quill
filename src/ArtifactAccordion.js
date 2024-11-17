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
    const [pendingEdit, setPendingEdit] = useState(null); // Track the pending row edit
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

    const handleSaveNewRow = async (label) => {
        const newRow = rows.find((row) => row.id === 31415926535 && row.isNew);

        // Don't submit if the newRow isn't found or if it's name field is empty
        if (!newRow || !newRow.name) {
            console.log("ERROR: new row needs name");
        } else {
            try {
                const postBody = {};
                Object.keys(newRow).forEach((key) => {
                    if (key !== 'isNew' && key !== 'isUpdated' && key !== 'id' && key !== 'uuid') {
                        postBody[key] = newRow[key];
                    }
                });
                await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${newRow.name}`, postBody);
                setNewRowPending(false);
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
        setNewRowPending(false);
    };

    // const handleSaveUpdatedRow = async (label, id) => {
    //     const updatedRow = artifacts[label].rows.find((row) => row.id === id && row.isUpdated);
    //     if (updatedRow) {
    //         try {
    //             await axios.patch(`http://127.0.0.1:8002/graph/node/${label}/${updatedRow.name}`, {
    //                 mass: updatedRow.mass,
    //                 value: updatedRow.value,
    //             });
    //             fetchArtifacts(label); // Refresh document list for the label
    //         } catch (error) {
    //             console.error('Error updating row:', error);
    //         }
    //     }
    // };

    const processRowUpdate = (editedRow) => {
        // if (editingRow && editingRow !== editedRow.id) {
        //     // If a different row is being edited, show the dialog
        //     setPendingEdit({ label, newRow: editedRow });
        //     setDialogOpen(true);
        //     return editingRow; // Revert to the previous row until the user decides
        // }

        setEditingRow(editedRow.id);
        setRows((prevRows) => {
            const updatedRows = prevRows.map((row) =>
                row.id === editedRow.id ? { ...editedRow, isUpdated: true } : row
            );
            return updatedRows;
        });
        return editedRow;
    };

    // const handleDiscardRowChanges = (discard) => {
    //     if (discard) {
    //         setEditingRow(null);
    //         if (pendingEdit) {
    //             processRowUpdate(pendingEdit.label, pendingEdit.newRow);
    //         }
    //     }
    //     setDialogOpen(false);
    //     setPendingEdit(null);
    // };

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
                            {!newRowPending ? (
                                <Button
                                    variant="contained"
                                    onClick={() => handleAddRow()}
                                    style={{ marginBottom: '20px' }}
                                >
                                    Add Row
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSaveNewRow(label)}
                                        style={{ marginBottom: '20px' }}
                                    >
                                        Save Row
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => handleCancelNewRow(label)}
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
                                {/* Button to Save the Row Updates */}
                                {/* {artifacts.rows.filter((row) => row.isNew).map((row) => (
                                    <Button
                                        key={`new-${row.id}`}
                                        variant="contained"
                                        onClick={() => handleSaveNewRow(label, row.id)}
                                        style={{ position: 'absolute', bottom: '25px', left: '25px' }}
                                    >
                                        Save Row
                                    </Button>
                                ))} */}
                                {/* {artifacts.rows.filter((row) => row.isUpdated && row.id === editingRow).map((row) => (
                                    <Button
                                        key={`updated-${row.id}`}
                                        variant="contained"
                                        onClick={() => handleSaveUpdatedRow(label, row.id)}
                                        style={{ marginTop: '10px', marginLeft: '10px' }}
                                    >
                                        Save Row Update {row.id}
                                    </Button>
                                ))} */}
                            </div>
                        </>
                    )}
                </AccordionDetails>
            </Accordion>
            {/* <Dialog open={dialogOpen} onClose={() => handleDiscardRowChanges(false)}>
                <DialogTitle>Discard Changes?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You are currently editing another row. Do you want to discard your changes and switch to a different row?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleDiscardRowChanges(false)} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => handleDiscardRowChanges(true)} color="primary">
                        Discard Changes
                    </Button>
                </DialogActions>
            </Dialog> */}
        </div>
    );
};

export default ArtifactAccordion;
