import React, { useState } from 'react';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';
import { ReadWriteDatagrid } from './ReadWriteDatagrid';

const ArtifactAccordion = ({ label, allowedProperties }) => {
    const [expanded, setExpanded] = useState(false);
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([]);
    const [editingRow, setEditingRow] = useState(null); // Track the currently edited row
    const [dialogOpen, setDialogOpen] = useState(false);

    // When accordion is expanded, fetch all Nodes for that Label
    const fetchArtifacts = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8002/graph/nodes/${label}`);
            const artifacts = response.data;

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
                    <ReadWriteDatagrid
                        label={label}
                        allowedProperties={allowedProperties}
                        rows={rows} setRows={setRows}
                        columns={columns}
                        editingRow={editingRow} setEditingRow={setEditingRow}
                        setDialogOpen={setDialogOpen}
                        refreshData={fetchArtifacts}
                    />
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
                </DialogActions>
            </Dialog>
        </div >
    );
};

export default ArtifactAccordion;
