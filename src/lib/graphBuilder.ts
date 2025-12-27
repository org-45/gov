import type { Node, Edge } from '@xyflow/react';
import type { GraphData, GraphNode, CustomNodeData } from '../types';

export function buildReactFlowGraph(
  data: GraphData,
  onNodeClick?: (node: GraphNode) => void
): { nodes: Node<CustomNodeData>[]; edges: Edge[] } {
  const nodes: Node<CustomNodeData>[] = data.nodes.map((node) => ({
    id: node.id,
    type: 'custom',
    position: { x: 0, y: 0 },
    data: {
      ...node,
      onNodeClick,
    },
  }));

  const edges: Edge[] = data.edges.map((edge, index) => ({
    id: `edge-${edge.from}-${edge.to}-${index}`,
    source: edge.from,
    target: edge.to,
    label: edge.relationship,
    type: 'smoothstep',
    animated: false,
  }));

  return { nodes, edges };
}
