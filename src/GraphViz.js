import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";
import Select from "react-select";
import CloseIcon from '@mui/icons-material/Close';
import AddRelationshipBox from "./AddRelationshipBox";

const GraphVisualization = () => {
  const chartRef = useRef(null); // Reference to the chart container element
  const chartInstance = useRef(null); // Holds the ECharts instance
  const [graphData, setGraphData] = useState({ nodes: [], links: [] }); // State to store graph data
  const [filteredNodes, setFilteredNodes] = useState([]); // Nodes to display after filtering
  const [selectedNodeLabels, setSelectedNodeLabels] = useState([]); // Selected labels from dropdown filter
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null); // Details of the currently selected node
  const [nodeProperties, setNodeProperties] = useState(null); // Properties of the clicked node fetched from API

  useEffect(() => {
    // Initialize the ECharts instance when the component mounts
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    // Fetch the graph data from the server
    axios.get("/fake_graph_data.json")
      .then((response) => {
        console.log("Graph data fetched:", response.data); // Debug log
        setGraphData(response.data); // Store the fetched graph data in state
        setFilteredNodes(response.data.nodes); // Initially display all nodes
        renderChart(response.data.nodes, response.data.links); // Render the chart with fetched data
      })
      .catch((error) => {
        console.error("Error fetching graph data:", error);
      });

    // Clean up the ECharts instance when the component unmounts
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  const renderChart = (nodes, links, highlightedNodes = null, highlightedLinks = null, centerCoords = ["50%", "50%"]) => {
    console.log("Rendering chart with nodes:", nodes); // Debug log
    console.log("Rendering chart with links:", links); // Debug log

    // Generate unique categories based on node labels
    const uniqueCategories = Array.from(
      new Set((nodes || []).flatMap((node) => node.label || []))
    );

    console.log("Unique categories for legend:", uniqueCategories); // Debug log

    // Define the ECharts options
    var options = {
      tooltip: {
        formatter: (params) => {
          // Define tooltip content for nodes and edges
          if (params.dataType === "node") {
            return `<b>${params.data.name}</b><br/>${params.data.category}`;
          } else if (params.dataType === "edge") {
            return `Type: ${params.data.type}`;
          }
        },
      },
      legend: {
        data: uniqueCategories, // Display categories in the legend
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          type: "graph",
          layout: "force", // Use a force-directed layout for the graph
          data: (nodes || []).map((node) => ({
            id: node.id,
            name: node.name,
            category: node.label ? node.label[0] : "Unknown",
            symbolSize: 50, // Size of the node symbol
            itemStyle: highlightedNodes
              ? {
                color: highlightedNodes.has(node.id) ? undefined : "#d3d3d3", // Highlight or gray out nodes
                opacity: highlightedNodes.has(node.id) ? 1 : 0.5,
              }
              : {}, // Default styles
          })),
          links: (links || []).map((link) => ({
            source: link.source,
            target: link.target,
            lineStyle: highlightedLinks
              ? {
                color: highlightedLinks.includes(link) ? undefined : "#d3d3d3", // Highlight or gray out links
                opacity: highlightedLinks.includes(link) ? 1 : 0.5,
              }
              : {}, // Default styles
          })),
          categories: uniqueCategories.map((category) => ({
            name: category, // Define categories for the legend
          })),
          roam: true, // Enable zoom and pan
          force: {
            repulsion: 1000, // Define repulsion force between nodes
            gravity: 0.01, // Minimal gravity to stabilize layout
            edgeLength: [100, 300], // Define the range of edge lengths
          },
          lineStyle: {
            color: 'source', // Color edges based on source node
          },
          scaleLimit: {
            min: 0.05, // Minimum zoom scale
            max: 0.15, // Maximum zoom scale
          },
          initialZoom: 0.05, // Set initial zoom scale
        },
      ],
    };

    // Set the options to the ECharts instance
    chartInstance.current.setOption(options);
  };

  const handleFilterChange = (selectedOptions) => {
    console.log("Filter change detected with options:", selectedOptions); // Debug log

    // Update the selected labels and filter nodes based on selection
    setSelectedNodeLabels(selectedOptions);

    const selectedLabels = selectedOptions.map((option) => option.value);
    const filtered = graphData.nodes.filter((node) =>
      selectedLabels.includes(node.label[0])
    );

    console.log("Filtered nodes after label selection:", filtered); // Debug log

    // Filter links to only include those connected to the filtered nodes
    const filteredLinks = graphData.links.filter(
      (link) =>
        filtered.some((node) => node.id === link.source) &&
        filtered.some((node) => node.id === link.target)
    );

    setFilteredNodes(filtered); // Update the filtered nodes state
    renderChart(filtered, filteredLinks); // Re-render the chart with filtered data
  };

  const handleNodeClick = async (clickedNodeId, centerCoords = ["50%", "50%"]) => {
    console.log("Node clicked with ID:", clickedNodeId); // Debug log

    // Find the clicked node in the filtered nodes
    const clickedNode = filteredNodes.find((node) => node.id === clickedNodeId);

    if (!clickedNode) {
      console.error(`Node with id ${clickedNodeId} not found in filteredNodes.`);
      return;
    }

    // Get IDs of nodes connected to the clicked node
    const connectedNodeIds = graphData.links
      .filter((link) => link.source === clickedNodeId || link.target === clickedNodeId)
      .map((link) => (link.source === clickedNodeId ? link.target : link.source));

    console.log("Connected node IDs:", connectedNodeIds); // Debug log

    // Find details of the connected nodes
    const connectedNodes = filteredNodes.filter((node) =>
      connectedNodeIds.includes(node.id)
    );

    console.log("Connected nodes:", connectedNodes); // Debug log

    // Highlight the clicked node and its connections
    const highlightedNodes = new Set([clickedNodeId, ...connectedNodeIds]);
    const highlightedLinks = graphData.links.filter(
      (link) => link.source === clickedNodeId || link.target === clickedNodeId
    );

    console.log("Highlighted nodes:", highlightedNodes); // Debug log
    console.log("Highlighted links:", highlightedLinks); // Debug log

    // Set details of the selected node and its connections
    const nodeInfo = {
      selectedNode: clickedNode.name,
      connectedNodes: connectedNodes.map((node) => node.name),
    };

    setSelectedNodeInfo(nodeInfo); // Store selected node details
    renderChart(filteredNodes, graphData.links, highlightedNodes, highlightedLinks, centerCoords);

    // Fetch properties of the clicked node from API
    try {
      const response = await axios.get(`http://127.0.0.1:8002/graph/uuid/node/${clickedNodeId}`);
      console.log("Node properties fetched:", response.data); // Debug log
      setNodeProperties(response.data); // Update node properties state
    } catch (error) {
      console.error(`Error fetching properties for node ${clickedNodeId}:`, error);
    }
  };

  const handleNodeSearch = (selectedOption) => {
    console.log("Node search triggered with option:", selectedOption); // Debug log

    // Handle search functionality by selecting a node by name
    if (!selectedOption) {
      setFilteredNodes(graphData.nodes); // Reset to all nodes if no search input
      renderChart(graphData.nodes, graphData.links);
      return;
    }

    const selectedNode = graphData.nodes.find((node) => node.name === selectedOption.value);

    if (!selectedNode) {
      console.error(`Node with name ${selectedOption.value} not found in graphData.`);
      return;
    }

    handleNodeClick(selectedNode.id); // Simulate a click on the searched node
  };

  const handleCloseInfoBox = () => {
    console.log("Closing info box"); // Debug log

    // Close the node information box and reset highlights
    setSelectedNodeInfo(null);
    setNodeProperties(null); // Clear node properties
    renderChart(filteredNodes, graphData.links);
  };

  useEffect(() => {
    // Attach click event listener to the ECharts instance
    if (chartInstance.current) {
      chartInstance.current.on("click", (params) => {
        console.log("Chart click event:", params); // Debug log

        if (params.dataType === "node") {
          handleNodeClick(params.data.id, [params.event.offsetX, params.event.offsetY]);
        }
      });
    }
  }, [filteredNodes]);

  // Prepare options for node search and label filter dropdowns
  const nodeOptions = graphData.nodes.map((node) => ({
    value: node.name,
    label: node.name,
  }));

  const labelOptions = Array.from(
    new Set(graphData.nodes.map((node) => node.label[0]))
  ).map((label) => ({
    value: label,
    label: label,
  }));

  return (
    <div>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <div style={{ width: "300px" }}>
          <Select
            isMulti
            options={labelOptions}
            value={selectedNodeLabels}
            onChange={handleFilterChange}
            placeholder="Filter by Node Labels"
          />
        </div>
        <div style={{ width: "300px" }}>
          <Select
            options={nodeOptions}
            isClearable
            onChange={handleNodeSearch}
            placeholder="Search Nodes by Name"
          />
        </div>
        <button
          style={{ padding: "10px", cursor: "pointer", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px" }}
          onClick={() => {
            console.log("View All button clicked"); // Debug log
            chartInstance.current.dispatchAction({
              type: 'restore', // Reset zoom and center
            });
          }}
        >
          View All
        </button>
        <AddRelationshipBox />
      </div>

      <div ref={chartRef} style={{ width: "100%", height: "90vh" }}></div>

      {selectedNodeInfo && (
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            padding: "20px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "300px",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              backgroundColor: "white",
              color: "gray",
              border: "none",
              borderRadius: "20%",
              cursor: "pointer",
              padding: "10px",
              transition: "transform 0.2s, background-color 0.2s",
            }}
            onClick={handleCloseInfoBox}
            onMouseEnter={(e) => {
              e.target.style.color = "white";
              e.target.style.opacity = 0.5;
              e.target.style.backgroundColor = "gray";
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "gray";
              e.target.style.backgroundColor = "white";
            }}
          >
            <CloseIcon sx={{ position: 'relative', top: '2px' }} />
          </button>
          <h3>Selected Artifact</h3>
          <h2>{selectedNodeInfo.selectedNode}</h2>
          <h4>Related to:</h4>
          <div style={{ maxHeight: "400px", overflow: "scroll" }}>
            {selectedNodeInfo.connectedNodes.map((node, index) => (
              <div
                key={index}
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} // Indicate clickable elements
                onClick={() => {
                  console.log("Clicked related node:", node); // Debug log
                  const selectedNode = graphData.nodes.find(n => n.name === node);
                  if (selectedNode) {
                    handleNodeClick(selectedNode.id);
                  }
                }}
              >
                {node}
              </div>
            ))}
          </div>
          {nodeProperties && (
            <>
              <h4>Node Properties</h4>
              <pre>{JSON.stringify(nodeProperties, null, 2)}</pre>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
