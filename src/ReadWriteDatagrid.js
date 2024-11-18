import React, { useState } from 'react';
import {
    Button,
    Snackbar,
    Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

export const ReadWriteDatagrid = ({ label, allowedProperties, rows, setRows, columns, editingRow, setEditingRow, setDialogOpen, refreshData }) => {
    const [open, setOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const [newRowPending, setNewRowPending] = useState(false);

    const triggerError = (message) => {
        setErrorMessage(message);
        setOpen(true);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return; // Prevent closing when clicking away
        }
        setOpen(false);
    };

    // Add a new row to the table, using the same column names that are already in this table, except:
    //   id: make up a number. We won't have the uuid until this is POSTed to the API, because the backend service creates the uuid
    const handleAddRow = () => {
        setRows((prevRows) => {
            const newRow = {};
            allowedProperties.forEach((key) => {
                newRow[key] = "";
            });

            newRow.id = 998877665544332211; //tmp row.id that datagrid requires to make the row
            newRow.thisIsANewDatagridRow123 = true;

            // Correctly return a new array by appending newRow
            return [...prevRows, newRow];
        });
        setNewRowPending(true);
    };

    const handleSaveNewRow = async () => {
        // Don't submit if the newRow isn't found or if it's name field is empty
        if (!editingRow || !editingRow.name) {
            triggerError("Row must have Name filled in")
        } else {
            try {
                const postBody = {};
                Object.keys(editingRow).forEach((key) => {
                    if (key !== 'thisIsANewDatagridRow123' && key !== 'id' && key !== 'uuid') {
                        postBody[key] = editingRow[key];
                    }
                });
                await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${editingRow.name}`, postBody);
                reset();
                refreshData(); // Refresh document list for the label
            } catch (error) {
                console.error('Error submitting new row:', error);
            }
        }
    };

    // Function to remove the new row before submitting it
    const handleCancelNewRow = () => {
        setRows((prevRows) => {
            // Filter out the row with the tmp id to get rid of it
            const updatedRows = prevRows.filter((row) => row.id !== 998877665544332211);

            // Return the updated rows array
            return updatedRows;
        });
        reset();
    };

    const handleSaveUpdatedRow = async () => {
        if (!editingRow || !editingRow.name) {
            triggerError("Row must have Name filled in")
        } else {
            if (editingRow) {
                try {
                    const postBody = {};
                    Object.keys(editingRow).forEach((key) => {
                        if (key !== 'thisIsANewDatagridRow123' && key !== 'id' && key !== 'uuid') {
                            postBody[key] = editingRow[key];
                        }
                    });
                    await axios.patch(`http://127.0.0.1:8002/graph/node/${label}/${editingRow.name}`, postBody);
                    reset();
                    refreshData(); // Refresh document list for the label
                } catch (error) {
                    console.error('Error updating row:', error);
                }
            }
        }
    };

    const processRowUpdate = (latestEditedRow) => {
        // We already started editing a row, now we're editing another row that's not that one
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
        refreshData(); // Refresh document list for the label
    };

    const reset = () => {
        setEditingRow(null);
        setNewRowPending(false);
        setDialogOpen(false);
    }

    return (
        <>
            {!newRowPending && !editingRow ? (
                <>
                    {/* No New Row and Not Editing Any Rows */}
                    <Button
                        variant="contained"
                        onClick={() => handleAddRow()}
                        style={{ marginBottom: '20px' }}
                    >
                        Add Row
                    </Button>
                </>
            ) : newRowPending && editingRow ? (
                <>
                    {/* New row added, being edited, but not yet submitted */}
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
                    {/* Editing an existing row */}
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
                        params.row.thisIsANewDatagridRow123 ? 'new-row' : ''
                    }
                    sx={{
                        "& .new-row": {
                            border: '2px solid black',
                            borderRadius: '4px',
                        },
                    }}
                />
                <Snackbar
                    open={open}
                    autoHideDuration={5000} // Auto-close after 6 seconds
                    onClose={handleClose}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                    sx={{
                        position: "absolute",
                        bottom: "20px", // Positioning inside the parent
                        left: "50%",
                        transform: "translateX(-50%)", // Center horizontally
                    }}
                >
                    <Alert
                        onClose={handleClose}
                        severity="error"
                        sx={{ width: "100%" }}
                    >
                        {errorMessage}
                    </Alert>
                </Snackbar>
            </div>
        </>
    )
}