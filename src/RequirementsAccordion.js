import React, { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const RequirementsAccordion = () => {
  const [rules, setRules] = useState([]);
  const [availableLabels, setAvailableLabels] = useState([]); // Example labels
  const [expanded, setExpanded] = useState('');
  const [documents, setDocuments] = useState({}); // Store documents for each label

  // Fetch Rules from API
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8002/graph/rules`);
        setRules(response.data);
        setAvailableLabels(Object.keys(response.data));
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchRules();
  }, []);

  const fetchDocuments = async (label) => {
    try {
      const formatted = label.replace(" ", "");
      const response = await axios.get(`http://127.0.0.1:8002/graph/nodes/${formatted}`);
      const columns = [
        { field: 'name', headerName: 'Name', width: 150, editable: true },
        { field: 'mass', headerName: 'Mass', width: 150, editable: true },
        { field: 'value', headerName: 'Value', width: 150, editable: true }
      ];

      const rows = response.data.map((item, index) => ({
        id: index + 1,
        name: item.name || null,
        mass: item.mass || null,
        value: item.value || null
      }));

      setDocuments((prevDocuments) => ({
        ...prevDocuments,
        [label]: { rows, columns }
      }));
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleAddRow = (label) => {
    setDocuments((prevDocuments) => {
      const newRow = { id: prevDocuments[label].rows.length + 1, name: '', mass: null, value: null, isNew: true };
      return {
        ...prevDocuments,
        [label]: {
          ...prevDocuments[label],
          rows: [...prevDocuments[label].rows, newRow]
        }
      };
    });
  };

  const handleSaveNewRow = async (label, id) => {
    const newRow = documents[label].rows.find((row) => row.id === id && row.isNew);
    if (newRow) {
      try {
        await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${newRow.name}`, {
          // name: newRow.name,
          mass: newRow.mass,
          value: newRow.value
        });
        fetchDocuments(label); // Refresh document list for the label
      } catch (error) {
        console.error('Error submitting new row:', error);
      }
    }
  };

  const processRowUpdate = (label, newRow) => {
    setDocuments((prevDocuments) => {
      const updatedRows = prevDocuments[label].rows.map((row) =>
        row.id === newRow.id ? newRow : row
      );
      return {
        ...prevDocuments,
        [label]: {
          ...prevDocuments[label],
          rows: updatedRows
        }
      };
    });
    return newRow;
  };

  return (
    <div>
      {availableLabels.map((label) => (
        <Accordion key={label} expanded={expanded === label} onChange={() => {
          setExpanded(expanded === label ? '' : label);
          if (!documents[label]) {
            fetchDocuments(label);
          }
        }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>{label}</AccordionSummary>
          <AccordionDetails>
            {documents[label] && (
              <>
                <Button variant="contained" onClick={() => handleAddRow(label)} style={{ marginBottom: '20px' }}>
                  Add New Row
                </Button>
                <div style={{ height: 400, width: '100%' }}>
                  <DataGrid
                    rows={documents[label].rows}
                    columns={documents[label].columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    processRowUpdate={(newRow) => processRowUpdate(label, newRow)}
                    experimentalFeatures={{ newEditingApi: true }}
                  />
                  {documents[label].rows.filter((row) => row.isNew).map((row) => (
                    <Button
                      key={row.id}
                      variant="contained"
                      onClick={() => handleSaveNewRow(label, row.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Save Row {row.id}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
    </div>
  );
};

export default RequirementsAccordion;
