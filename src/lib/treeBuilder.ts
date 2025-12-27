import { GraphData, GraphNode, GraphEdge, TreeNodeData } from '../types';

// Relationship priority for selecting primary parent
// Lower number = higher priority
const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'elects': 1,
  'appoints': 2,
  'leads': 3,
  'comprises': 4,
  'includes': 5,
  'oversees': 6,
};

interface ParentInfo {
  primary: string | null;
  secondary: Array<{ id: string; relationship: string }>;
}

/**
 * Build a tree structure from graph data by selecting primary parents
 * for nodes with multiple incoming edges
 */
export function buildTreeStructure(graphData: GraphData): TreeNodeData[] {
  const nodeMap = new Map(graphData.nodes.map(n => [n.id, n]));
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, ParentInfo>();

  // Build parent-child relationships
  graphData.edges.forEach(edge => {
    // Add to children map
    const children = childrenMap.get(edge.from) || [];
    childrenMap.set(edge.from, [...children, edge.to]);

    // Determine primary vs secondary parent
    const parentInfo = parentMap.get(edge.to) || { primary: null, secondary: [] };

    if (!parentInfo.primary) {
      // First parent becomes primary
      parentInfo.primary = edge.from;
    } else {
      // Check if this should be the primary parent based on relationship priority
      const currentPriority = RELATIONSHIP_PRIORITY[edge.relationship || ''] || 999;
      const existingPriority = RELATIONSHIP_PRIORITY[
        graphData.edges.find(e => e.from === parentInfo.primary && e.to === edge.to)?.relationship || ''
      ] || 999;

      if (currentPriority < existingPriority) {
        // This relationship is stronger - make it primary
        parentInfo.secondary.push({
          id: parentInfo.primary,
          relationship: graphData.edges.find(e => e.from === parentInfo.primary && e.to === edge.to)?.relationship || ''
        });
        parentInfo.primary = edge.from;
      } else {
        // Keep as secondary parent
        parentInfo.secondary.push({
          id: edge.from,
          relationship: edge.relationship || ''
        });
      }
    }

    parentMap.set(edge.to, parentInfo);
  });

  // Find root nodes (tier 1 or nodes with no parents)
  const rootNodes = graphData.nodes.filter(n =>
    n.tier === 1 || !parentMap.has(n.id)
  );

  // Build tree recursively from roots
  const trees = rootNodes.map(root =>
    buildTreeNode(root, childrenMap, nodeMap, parentMap, graphData.edges, 0, null)
  );

  return trees;
}

/**
 * Recursively build a tree node with all its children
 */
function buildTreeNode(
  node: GraphNode,
  childrenMap: Map<string, string[]>,
  nodeMap: Map<string, GraphNode>,
  parentMap: Map<string, ParentInfo>,
  edges: GraphEdge[],
  depth: number,
  parent: TreeNodeData | null,
  visited = new Set<string>()
): TreeNodeData {
  // Prevent infinite recursion from cycles
  if (visited.has(node.id)) {
    return {
      ...node,
      children: [],
      parent: parent || undefined,
      depth,
      secondaryParents: parentMap.get(node.id)?.secondary || []
    };
  }

  visited.add(node.id);

  const treeNode: TreeNodeData = {
    ...node,
    children: [],
    parent: parent || undefined,
    depth,
    secondaryParents: parentMap.get(node.id)?.secondary || []
  };

  // Get children for this node
  const childIds = childrenMap.get(node.id) || [];

  // For each child, only include if this node is its primary parent
  childIds.forEach(childId => {
    const childNode = nodeMap.get(childId);
    if (!childNode) return;

    const childParentInfo = parentMap.get(childId);
    if (!childParentInfo || childParentInfo.primary === node.id) {
      // This is the primary parent - include child in tree
      const childTreeNode = buildTreeNode(
        childNode,
        childrenMap,
        nodeMap,
        parentMap,
        edges,
        depth + 1,
        treeNode,
        new Set(visited)
      );
      treeNode.children.push(childTreeNode);
    }
  });

  return treeNode;
}

/**
 * Get all nodes in tree (flattened)
 */
export function flattenTree(roots: TreeNodeData[]): TreeNodeData[] {
  const result: TreeNodeData[] = [];

  function traverse(node: TreeNodeData) {
    result.push(node);
    node.children.forEach(traverse);
  }

  roots.forEach(traverse);
  return result;
}

/**
 * Get node type color (matching existing graph visualization)
 */
export function getNodeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    executive: '#3b82f6',
    legislative: '#10b981',
    judicial: '#f59e0b',
    constitutional: '#8b5cf6',
    ministry: '#06b6d4',
    provincial: '#ec4899',
    local: '#14b8a6',
  };
  return colors[type] || '#6b7280';
}
