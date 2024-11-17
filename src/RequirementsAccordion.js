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
      const response = await axios.get(`http://127.0.0.1:8002/graph/nodes/${label}`);
      const data = response.data

      var allowedProperties = []
      if (rules) {
        console.log(rules)
        allowedProperties = rules[label].allowed_properties;
      } else {
        console.error(`Label "${label}" not found.`);
      }

      // Create the columns Object for datagrid (only column types allowed are the allowed properies for the node's Label type)
      const columns = allowedProperties.map((property) => ({
        field: property,
        headerName: property.charAt(0).toUpperCase() + property.slice(1), // Capitalize the first letter
        width: 150,
        editable: true,
      }));

      console.log("data:\n" + data)

      // Create the rows Object for datagrid (keys must match the column fields above)
      //   this just renames the uuid field to id, because the datagrid object requires that field name for unique rows
      const rows = data.map(item => {
        const { uuid, ...rest } = item;
        return { id: uuid, ...rest };
      });

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
      console.log(newRow)
      try {
        const postBody = {};
        Object.keys(newRow).forEach((key) => {
          if (key !== 'isNew' && key !== 'isUpdated' && key !== 'id' && key !== 'uuid') {
            postBody[key] = newRow[key];
          }
        });
        await axios.post(`http://127.0.0.1:8002/graph/node/${label}/${newRow.name}`, postBody);
        fetchDocuments(label); // Refresh document list for the label
      } catch (error) {
        console.error('Error submitting new row:', error);
      }
    }
  };

  const handleSaveUpdatedRow = async (label, id) => {
    const updatedRow = documents[label].rows.find((row) => row.id === id && row.isUpdated);
    if (updatedRow) {
      try {
        await axios.patch(`http://127.0.0.1:8002/graph/node/${label}/${updatedRow.name}`, {
          mass: updatedRow.mass,
          value: updatedRow.value
        });
        fetchDocuments(label); // Refresh document list for the label
      } catch (error) {
        console.error('Error updating row:', error);
      }
    }
  };

  const processRowUpdate = (label, newRow) => {
    setDocuments((prevDocuments) => {
      const updatedRows = prevDocuments[label].rows.map((row) =>
        row.id === newRow.id ? { ...newRow, isUpdated: true } : row
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
        <Accordion style={{width: "80%"}} key={label} expanded={expanded === label} onChange={() => {
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
                      key={`new-${row.id}`}
                      variant="contained"
                      onClick={() => handleSaveNewRow(label, row.id)}
                      style={{ marginTop: '10px' }}
                    >
                      Save Row {row.id}
                    </Button>
                  ))}
                  {documents[label].rows.filter((row) => row.isUpdated).map((row) => (
                    <Button
                      key={`updated-${row.id}`}
                      variant="contained"
                      onClick={() => handleSaveUpdatedRow(label, row.id)}
                      style={{ marginTop: '10px', marginLeft: '10px' }}
                    >
                      Save Row Update {row.id}
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
