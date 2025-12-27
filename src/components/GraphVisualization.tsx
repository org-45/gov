import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './CustomNode';
import { NodeDetails } from './NodeDetails';
import { loadGraphData, getDataFileFromUrl } from '../lib/dataLoader';
import { buildReactFlowGraph } from '../lib/graphBuilder';
import { getLayoutedElements } from '../lib/layoutEngine';
import type { GraphData, GraphNode } from '../types';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function GraphVisualization() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const dataFile = getDataFileFromUrl();
        const data = await loadGraphData(dataFile);
        setGraphData(data);

        const { nodes: graphNodes, edges: graphEdges } = buildReactFlowGraph(
          data,
          setSelectedNode
        );

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
          graphNodes,
          graphEdges,
          'TB'
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
        console.error('Error loading graph:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setNodes, setEdges]);

  const handleCloseDetails = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading visualization...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-lg shadow-lg">
          <div className="text-red-600 text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
      {graphData && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10 max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{graphData.metadata.title}</h1>
          <p className="text-sm text-gray-600 mb-2">{graphData.metadata.description}</p>
          <p className="text-xs text-gray-500">
            Last updated: {graphData.metadata.lastUpdated}
          </p>
        </div>
      )}

      <NodeDetails node={selectedNode} onClose={handleCloseDetails} />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: false,
        }}
      >
        <Background color="#f3f4f6" gap={16} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colorMap: Record<string, string> = {
              executive: '#3b82f6',
              legislative: '#10b981',
              judicial: '#f59e0b',
              constitutional: '#8b5cf6',
              ministry: '#06b6d4',
              provincial: '#ec4899',
              local: '#14b8a6',
            };
            const nodeData = node.data as { type?: string };
            return colorMap[nodeData.type || ''] || '#6b7280';
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
}
