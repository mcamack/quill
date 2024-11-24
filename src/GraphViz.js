import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";

const GraphVisualization = () => {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const [graphData, setGraphData] = useState({ nodes: [], links: [] }); // Store the graph data
    const [selectedNodeInfo, setSelectedNodeInfo] = useState(null);

    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        // Fetch graph data and render chart
        axios.get("/fake_graph_data.json") // Replace with your actual data URL
            .then((response) => {
                setGraphData(response.data); // Store the graph data in state
                renderChart(response.data);
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

    const renderChart = (data, highlightedNodes = null, highlightedLinks = null) => {
        const uniqueCategories = Array.from(
            new Set((data.nodes || []).flatMap((node) => node.label || []))
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
                    data: (data.nodes || []).map((node) => ({
                        id: node.id,
                        name: node.name,
                        category: node.label ? node.label[0] : "Unknown",
                        symbolSize: 50,
                        itemStyle: highlightedNodes
                            ? {
                                color: highlightedNodes.has(node.id) ? "red" : "#d3d3d3",
                                opacity: highlightedNodes.has(node.id) ? 1 : 0.5,
                            }
                            : {}, // Default style if no node is selected
                    })),
                    links: (data.links || []).map((link) => ({
                        source: link.source,
                        target: link.target,
                        lineStyle: highlightedLinks
                            ? {
                                color: highlightedLinks.includes(link) ? "red" : "#d3d3d3",
                                opacity: highlightedLinks.includes(link) ? 1 : 0.5,
                            }
                            : {}, // Default style if no node is selected
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

    const handleNodeClick = (clickedNodeId) => {
        // Find the clicked node
        const clickedNode = graphData.nodes.find((node) => node.id === clickedNodeId);

        // Handle the case where the clicked node is not found
        if (!clickedNode) {
            console.error(`Node with id ${clickedNodeId} not found in graphData.`);
            return;
        }

        // Find connected nodes
        const connectedNodeIds = graphData.links
            .filter((link) => link.source === clickedNodeId || link.target === clickedNodeId)
            .map((link) => (link.source === clickedNodeId ? link.target : link.source));

        const connectedNodes = graphData.nodes.filter((node) =>
            connectedNodeIds.includes(node.id)
        );

        // Highlight clicked node and its connections
        const highlightedNodes = new Set([clickedNodeId, ...connectedNodeIds]);
        const highlightedLinks = graphData.links.filter(
            (link) => link.source === clickedNodeId || link.target === clickedNodeId
        );

        // Prepare node information
        const nodeInfo = {
            selectedNode: clickedNode.name,
            connectedNodes: connectedNodes.map((node) => node.name),
        };

        // Update state and re-render chart
        setSelectedNodeInfo(nodeInfo);
        renderChart(graphData, highlightedNodes, highlightedLinks);
    };


    const handleCloseInfoBox = () => {
        // Clear the selected node info
        setSelectedNodeInfo(null);
        // Re-render the graph with default styles
        renderChart(graphData);
    };

    useEffect(() => {
        if (chartInstance.current) {
            chartInstance.current.on("click", function (params) {
                if (params.dataType === "node") {
                    handleNodeClick(params.data.id);
                }
            });
        }
    }, [graphData]);

    return (
        <div>
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
