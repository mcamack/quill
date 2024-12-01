import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";
import Select from "react-select";
import CloseIcon from '@mui/icons-material/Close';

const GraphVisualization = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [filteredNodes, setFilteredNodes] = useState([]); // Nodes to display
  const [selectedNodeLabels, setSelectedNodeLabels] = useState([]); // Selected labels from dropdown
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null); // Selected node details
  const [nodeProperties, setNodeProperties] = useState(null); // Fetched properties of the clicked node

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    axios.get("/fake_graph_data.json") // Correct file name
      .then((response) => {
        setGraphData(response.data);
        setFilteredNodes(response.data.nodes); // Initially display all nodes
        renderChart(response.data.nodes, response.data.links);
      })
      .catch((error) => {
        console.error("Error fetching graph data:", error);
      });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
    };
  }, []);

  const renderChart = (nodes, links, highlightedNodes = null, highlightedLinks = null) => {
    const uniqueCategories = Array.from(
      new Set((nodes || []).flatMap((node) => node.label || []))
    );

    const options = {
      tooltip: {
        formatter: (params) => {
          if (params.dataType === "node") {
            return `Node: ${params.data.name}<br/>Labels: ${params.data.category}`;
          } else if (params.dataType === "edge") {
            return `Type: ${params.data.type}`;
          }
        },
      },
      legend: {
        data: uniqueCategories,
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          type: "graph",
          layout: "force",
          data: (nodes || []).map((node) => ({
            id: node.id,
            name: node.name,
            category: node.label ? node.label[0] : "Unknown",
            symbolSize: 50,
            itemStyle: highlightedNodes
              ? {
                color: highlightedNodes.has(node.id) ? undefined : "#d3d3d3", // Highlighted nodes keep their color; others are grayed out
                opacity: highlightedNodes.has(node.id) ? 1 : 0.5,
              }
              : {}, // Default styles
          })),
          links: (links || []).map((link) => ({
            source: link.source,
            target: link.target,
            lineStyle: highlightedLinks
              ? {
                color: highlightedLinks.includes(link) ? undefined : "#d3d3d3", // Highlighted links keep their color
                opacity: highlightedLinks.includes(link) ? 1 : 0.5,
              }
              : {}, // Default styles
          })),
          categories: uniqueCategories.map((category) => ({
            name: category,
          })),
          roam: true,
          force: {
            repulsion: 500,
            gravity: 0.05,
            edgeLength: [100, 300],
          },
        },
      ],
    };

    chartInstance.current.setOption(options);
  };

  const handleFilterChange = (selectedOptions) => {
    setSelectedNodeLabels(selectedOptions);

    const selectedLabels = selectedOptions.map((option) => option.value);
    const filtered = graphData.nodes.filter((node) =>
      selectedLabels.includes(node.label[0])
    );

    const filteredLinks = graphData.links.filter(
      (link) =>
        filtered.some((node) => node.id === link.source) &&
        filtered.some((node) => node.id === link.target)
    );

    setFilteredNodes(filtered);
    renderChart(filtered, filteredLinks);
  };

  const handleNodeClick = async (clickedNodeId) => {
    const clickedNode = filteredNodes.find((node) => node.id === clickedNodeId);

    if (!clickedNode) {
      console.error(`Node with id ${clickedNodeId} not found in filteredNodes.`);
      return;
    }

    const connectedNodeIds = graphData.links
      .filter((link) => link.source === clickedNodeId || link.target === clickedNodeId)
      .map((link) => (link.source === clickedNodeId ? link.target : link.source));

    const connectedNodes = filteredNodes.filter((node) =>
      connectedNodeIds.includes(node.id)
    );

    const highlightedNodes = new Set([clickedNodeId, ...connectedNodeIds]);
    const highlightedLinks = graphData.links.filter(
      (link) => link.source === clickedNodeId || link.target === clickedNodeId
    );

    const nodeInfo = {
      selectedNode: clickedNode.name,
      connectedNodes: connectedNodes.map((node) => node.name),
    };

    setSelectedNodeInfo(nodeInfo);
    renderChart(filteredNodes, graphData.links, highlightedNodes, highlightedLinks);

    // Fetch properties of the clicked node
    try {
      const response = await axios.get(`http://127.0.0.1:8002/graph/uuid/node/${clickedNodeId}`);
      setNodeProperties(response.data); // Set the fetched properties
    } catch (error) {
      console.error(`Error fetching properties for node ${clickedNodeId}:`, error);
    }
  };

  const handleNodeSearch = (selectedOption) => {
    if (!selectedOption) {
      setFilteredNodes(graphData.nodes);
      renderChart(graphData.nodes, graphData.links);
      return;
    }

    const selectedNode = graphData.nodes.find((node) => node.name === selectedOption.value);

    if (!selectedNode) {
      console.error(`Node with name ${selectedOption.value} not found in graphData.`);
      return;
    }

    handleNodeClick(selectedNode.id); // Reuse the `handleNodeClick` functionality
  };

  const handleCloseInfoBox = () => {
    setSelectedNodeInfo(null);
    setNodeProperties(null); // Clear node properties when closing
    renderChart(filteredNodes, graphData.links);
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.on("click", (params) => {
        if (params.dataType === "node") {
          handleNodeClick(params.data.id);
        }
      });
    }
  }, [filteredNodes]);

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
          {/* <p>{selectedNodeInfo.selectedNode}</p> */}
          <h2>{selectedNodeInfo.selectedNode}</h2>
          <h4>Related to:</h4>
          <div style={{ maxHeight: "400px", overflow: "scroll" }}>

              {selectedNodeInfo.connectedNodes.map((node, index) => (
                <div
                  key={index}
                  style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }} // To indicate that it's clickable
                  onClick={() => {
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
