import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";
import Select from "react-select";

const GraphVisualization = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [filteredNodes, setFilteredNodes] = useState([]); // Nodes to display
  const [selectedNodeLabels, setSelectedNodeLabels] = useState([]); // Selected labels from dropdown
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null); // Selected node details

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }

    axios.get("/fake_graph_data.json") // Replace with your actual data URL
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

  const handleNodeClick = (clickedNodeId) => {
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
            padding: "10px",
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "5px",
            width: "300px",
          }}
        >
          <button
            style={{
              position: "absolute",
              top: "5px",
              right: "5px",
              backgroundColor: "red",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
              padding: "5px",
            }}
            onClick={handleCloseInfoBox}
          >
            Close
          </button>
          <h3>Selected Node</h3>
          <p>{selectedNodeInfo.selectedNode}</p>
          <h4>Connected Nodes</h4>
          <ul>
            {selectedNodeInfo.connectedNodes.map((node, index) => (
              <li key={index}>{node}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GraphVisualization;
