import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type NodeTypes,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { CustomNode } from './CustomNode';
import { NodeDetails } from './NodeDetails';
import { getLayoutedElements } from '../lib/layoutEngine';
import type { GraphNode, CustomNodeData } from '../types';
import type { ProcessedData } from '../lib/dataProcessor';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

interface TreeVisualizationProps {
  processedData: ProcessedData;
  selectedNode: GraphNode | null;
  onNodeSelect: (node: GraphNode | null) => void;
  hideNodeDetails?: boolean;
}

function TreeVisualizationInner({
  processedData,
  selectedNode,
  onNodeSelect,
  hideNodeDetails = false,
}: TreeVisualizationProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const lastExpandedNodeRef = useRef<string | null>(null);
  const { fitView, getNode } = useReactFlow();

  // Toggle node expansion
  const handleNodeToggle = useCallback((nodeId: string) => {
    lastExpandedNodeRef.current = nodeId;
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    // Use pre-built tree from processed data
    const { tree, raw } = processedData;

    // Convert tree to React Flow nodes and edges (only visible ones)
    const flowNodes: Node<CustomNodeData>[] = [];
    const flowEdges: Edge[] = [];

    // Flatten tree and create nodes/edges (respecting collapsed state)
    function processNode(node: any, parentId?: string, depth: number = 0): void {
      const isExpanded = expandedNodes.has(node.id);
      const hasChildren = node.children && node.children.length > 0;

      // Add node with expansion state
      flowNodes.push({
        id: node.id,
        type: 'custom',
        position: { x: 0, y: 0 }, // Will be positioned by dagre
        data: {
          ...node,
          onNodeClick: onNodeSelect,
          isExpanded,
          hasChildren,
          childCount: hasChildren ? node.children.length : 0,
          onToggle: hasChildren ? () => handleNodeToggle(node.id) : undefined,
        },
      });

      // Add edge from parent
      if (parentId) {
        const relationship = raw.edges.find(
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

      // Process children only if expanded
      if (hasChildren && isExpanded) {
        node.children.forEach((child: any) => processNode(child, node.id, depth + 1));
      }
    }

    // Process each root (tree is already built!)
    tree.forEach(root => processNode(root));

    // Apply tree layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      flowNodes,
      flowEdges,
      'TB' // Top to bottom
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

    // Focus on the last expanded/collapsed node
    if (lastExpandedNodeRef.current) {
      setTimeout(() => {
        const nodeId = lastExpandedNodeRef.current;
        if (nodeId) {
          const node = getNode(nodeId);
          if (node) {
            // Center the viewport on the expanded node and its children
            fitView({
              nodes: [{ id: nodeId }],
              duration: 300,
              padding: 0.5,
            });
          }
        }
      }, 50);
    }
  }, [processedData, expandedNodes, setNodes, setEdges, onNodeSelect, handleNodeToggle, fitView, getNode]);

  const handleCloseDetails = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  // Expand/Collapse all nodes
  const expandAll = useCallback(() => {
    const allNodeIds = new Set<string>();
    function collectIds(node: any) {
      if (node.children && node.children.length > 0) {
        allNodeIds.add(node.id);
        node.children.forEach(collectIds);
      }
    }
    processedData.tree.forEach(collectIds);
    setExpandedNodes(allNodeIds);
  }, [processedData]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  return (
    <div className="h-full w-full relative">
      {!hideNodeDetails && <NodeDetails node={selectedNode} onClose={handleCloseDetails} />}

      {/* Tree Controls */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button
          onClick={expandAll}
          className="px-4 py-2 bg-white rounded-lg shadow-md border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-all cursor-pointer"
          title="Expand all nodes to show full tree"
        >
          ⊕ Expand All
        </button>
        <button
          onClick={collapseAll}
          className="px-4 py-2 bg-white rounded-lg shadow-md border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 text-sm font-medium text-gray-700 hover:text-red-700 transition-all cursor-pointer"
          title="Collapse all nodes to show only roots"
        >
          ⊖ Collapse All
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
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

export default function TreeVisualization(props: TreeVisualizationProps) {
  return (
    <ReactFlowProvider>
      <TreeVisualizationInner {...props} />
    </ReactFlowProvider>
  );
}
