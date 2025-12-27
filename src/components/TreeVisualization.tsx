import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './CustomNode';
import { NodeDetails } from './NodeDetails';
import { buildTreeStructure } from '../lib/treeBuilder';
import { getLayoutedElements } from '../lib/layoutEngine';
import type { GraphData, GraphNode, CustomNodeData } from '../types';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface TreeVisualizationProps {
  data: GraphData | null;
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
}

export default function TreeVisualization({
  data,
  selectedNode,
  onNodeSelect,
}: TreeVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    if (!data) return;

    // Build tree structure
    const treeRoots = buildTreeStructure(data);

    // Convert tree to React Flow nodes and edges
    const flowNodes: Node<CustomNodeData>[] = [];
    const flowEdges: Edge[] = [];

    // Flatten tree and create nodes/edges
    function processNode(node: any, parentId?: string) {
      // Add node
      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 }, // Will be positioned by dagre
        data: {
          ...node,
          onNodeClick: onNodeSelect,
        },
      });

      // Add edge from parent
      if (parentId && data) {
        const relationship = data.edges.find(
          e => e.from === parentId && e.to === node.id
        )?.relationship;

        flowEdges.push({
          id: `${parentId}-${node.id}`,
          source: parentId,
          target: node.id,
          label: relationship,
          type: 'smoothstep',
          animated: false,
        });
      }

      // Process children
      if (node.children && node.children.length > 0) {
        node.children.forEach((child: any) => processNode(child, node.id));
      }
    }

    // Process each root
    treeRoots.forEach(root => processNode(root));

    // Apply tree layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      'TB' // Top to bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [data, setNodes, setEdges, onNodeSelect]);

  const handleCloseDetails = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  if (!data) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading tree view...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
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
      </ReactFlow>
    </div>
  );
}
