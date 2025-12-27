export type NodeType = 'executive' | 'legislative' | 'judicial' | 'constitutional' | 'ministry' | 'provincial' | 'local';

export interface NodeMetadata {
  [key: string]: string | number | boolean;
}

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  tier?: number;
  description?: string;
  currentHolder?: string;
  metadata?: NodeMetadata;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship?: string;
}

export interface GraphMetadata {
  title: string;
  description: string;
  lastUpdated: string;
  country?: string;
  source?: string;
  [key: string]: string | undefined;
}

export interface GraphData {
  metadata: GraphMetadata;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface CustomNodeData extends GraphNode {
  onNodeClick?: (node: GraphNode) => void;
  [key: string]: unknown;
}
