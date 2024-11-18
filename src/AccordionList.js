import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ArtifactAccordion from './ArtifactAccordion';

const AccordionList = () => {
  const [artifactRules, setArtifactRules] = useState([]);
  const [artifactLabels, setArtifactLabels] = useState([]);

  const getAllowedPropertiesFromRules = (label) => {
    
    var allowedProperties = [];
    if (artifactRules) {
        allowedProperties = artifactRules[label].allowed_properties;
    } else {
        console.error(`Label "${label}" not found.`);
    }
    return allowedProperties;
};

  // Fetch Rules from API
  useEffect(() => {
    const fetchRules = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8002/graph/rules`);
        setArtifactRules(response.data);
        setArtifactLabels(Object.keys(response.data));
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };
    fetchRules();
  }, []);

  return (
    <div>
      {/* Create an accordion for each Label */}
      {artifactLabels.map((label) => (
        <ArtifactAccordion key={label}
          label={label}
          allowedProperties={getAllowedPropertiesFromRules(label)}
        />
      ))}
    </div>
  );
};

export default AccordionList;
