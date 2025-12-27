import type { GraphData, GraphNode, GraphEdge, TreeNodeData } from '../types';

/**
 * Optimized data processor that creates visualization-ready data structures
 * This layer sits between raw data loading and UI rendering
 */

// ============================================================================
// INDEXES & LOOKUPS (O(1) access)
// ============================================================================

export interface DataIndexes {
  nodeById: Map<string, GraphNode>;
  edgesBySource: Map<string, GraphEdge[]>;
  edgesByTarget: Map<string, GraphEdge[]>;
  nodesByType: Map<string, GraphNode[]>;
  nodesByTier: Map<number, GraphNode[]>;
}

/**
 * Build optimized indexes for fast lookups
 */
export function buildDataIndexes(data: GraphData): DataIndexes {
  const nodeById = new Map<string, GraphNode>();
  const edgesBySource = new Map<string, GraphEdge[]>();
  const edgesByTarget = new Map<string, GraphEdge[]>();
  const nodesByType = new Map<string, GraphNode[]>();
  const nodesByTier = new Map<number, GraphNode[]>();

  // Index nodes
  data.nodes.forEach(node => {
    nodeById.set(node.id, node);

    // Group by type
    const typeGroup = nodesByType.get(node.type) || [];
    typeGroup.push(node);
    nodesByType.set(node.type, typeGroup);

    // Group by tier
    const tier = node.tier || 0;
    const tierGroup = nodesByTier.get(tier) || [];
    tierGroup.push(node);
    nodesByTier.set(tier, tierGroup);
  });

  // Index edges
  data.edges.forEach(edge => {
    // By source
    const sourceEdges = edgesBySource.get(edge.from) || [];
    sourceEdges.push(edge);
    edgesBySource.set(edge.from, sourceEdges);

    // By target
    const targetEdges = edgesByTarget.get(edge.to) || [];
    targetEdges.push(edge);
    edgesByTarget.set(edge.to, targetEdges);
  });

  return {
    nodeById,
    edgesBySource,
    edgesByTarget,
    nodesByType,
    nodesByTier,
  };
}

// ============================================================================
// HIERARCHY PROCESSING
// ============================================================================

export interface HierarchyInfo {
  roots: GraphNode[];
  parentMap: Map<string, string[]>; // nodeId -> parent ids
  childrenMap: Map<string, string[]>; // nodeId -> children ids
  levels: Map<number, GraphNode[]>; // level -> nodes at that level
}

/**
 * Analyze and extract hierarchy information
 */
export function analyzeHierarchy(data: GraphData, indexes: DataIndexes): HierarchyInfo {
  const parentMap = new Map<string, string[]>();
  const childrenMap = new Map<string, string[]>();
  const levels = new Map<number, GraphNode[]>();

  // Build parent/children maps
  data.edges.forEach(edge => {
    // Children
    const children = childrenMap.get(edge.from) || [];
    children.push(edge.to);
    childrenMap.set(edge.from, children);

    // Parents
    const parents = parentMap.get(edge.to) || [];
    parents.push(edge.from);
    parentMap.set(edge.to, parents);
  });

  // Find root nodes (no parents OR tier 1)
  const roots = data.nodes.filter(n =>
    n.tier === 1 || !parentMap.has(n.id) || parentMap.get(n.id)!.length === 0
  );

  // Calculate levels (BFS from roots)
  const visited = new Set<string>();
  const queue: Array<{ node: GraphNode; level: number }> = roots.map(n => ({ node: n, level: 0 }));

  while (queue.length > 0) {
    const { node, level } = queue.shift()!;

    if (visited.has(node.id)) continue;
    visited.add(node.id);

    const levelNodes = levels.get(level) || [];
    levelNodes.push(node);
    levels.set(level, levelNodes);

    const children = childrenMap.get(node.id) || [];
    children.forEach(childId => {
      const childNode = indexes.nodeById.get(childId);
      if (childNode && !visited.has(childId)) {
        queue.push({ node: childNode, level: level + 1 });
      }
    });
  }

  return { roots, parentMap, childrenMap, levels };
}

// ============================================================================
// TREE BUILDING
// ============================================================================

const RELATIONSHIP_PRIORITY: Record<string, number> = {
  'elects': 1,
  'appoints': 2,
  'leads': 3,
  'comprises': 4,
  'includes': 5,
  'oversees': 6,
};

/**
 * Select primary parent based on relationship strength
 */
function selectPrimaryParent(
  nodeId: string,
  parents: string[],
  edges: GraphEdge[]
): { primary: string; secondary: Array<{ id: string; relationship: string }> } {
  if (parents.length === 0) {
    return { primary: '', secondary: [] };
  }

  if (parents.length === 1) {
    return { primary: parents[0], secondary: [] };
  }

  // Find edges and sort by priority
  const parentEdges = parents.map(parentId => {
    const edge = edges.find(e => e.from === parentId && e.to === nodeId);
    const priority = RELATIONSHIP_PRIORITY[edge?.relationship || ''] || 999;
    return { parentId, edge, priority };
  });

  parentEdges.sort((a, b) => a.priority - b.priority);

  const primary = parentEdges[0].parentId;
  const secondary = parentEdges.slice(1).map(p => ({
    id: p.parentId,
    relationship: p.edge?.relationship || ''
  }));

  return { primary, secondary };
}

/**
 * Build optimized tree structure
 */
export function buildOptimizedTree(
  data: GraphData,
  indexes: DataIndexes,
  hierarchy: HierarchyInfo
): TreeNodeData[] {
  const { roots, parentMap, childrenMap } = hierarchy;

  // Build tree recursively
  function buildNode(
    node: GraphNode,
    visited: Set<string> = new Set()
  ): TreeNodeData {
    // Prevent cycles
    if (visited.has(node.id)) {
      return {
        ...node,
        children: [],
        depth: 0,
        secondaryParents: [],
      };
    }

    visited.add(node.id);

    // Get all children
    const childIds = childrenMap.get(node.id) || [];

    // For each child, check if this node is its primary parent
    const children: TreeNodeData[] = [];

    childIds.forEach(childId => {
      const childNode = indexes.nodeById.get(childId);
      if (!childNode) return;

      const childParents = parentMap.get(childId) || [];
      const { primary } = selectPrimaryParent(childId, childParents, data.edges);

      // Only include if we're the primary parent
      if (primary === node.id) {
        children.push(buildNode(childNode, new Set(visited)));
      }
    });

    // Get secondary parents for this node
    const myParents = parentMap.get(node.id) || [];
    const { secondary } = selectPrimaryParent(node.id, myParents, data.edges);

    return {
      ...node,
      children,
      depth: 0, // Will be calculated later if needed
      secondaryParents: secondary,
    };
  }

  return roots.map(root => buildNode(root));
}

// ============================================================================
// STATISTICS
// ============================================================================

export interface DataStatistics {
  totalNodes: number;
  totalEdges: number;
  nodesByType: Record<string, number>;
  averageConnections: number;
  maxDepth: number;
  rootCount: number;
}

/**
 * Calculate statistics about the data
 */
export function calculateStatistics(
  data: GraphData,
  indexes: DataIndexes,
  hierarchy: HierarchyInfo
): DataStatistics {
  const nodesByType: Record<string, number> = {};

  indexes.nodesByType.forEach((nodes, type) => {
    nodesByType[type] = nodes.length;
  });

  const totalConnections = data.edges.length * 2; // Each edge connects 2 nodes
  const averageConnections = data.nodes.length > 0
    ? totalConnections / data.nodes.length
    : 0;

  return {
    totalNodes: data.nodes.length,
    totalEdges: data.edges.length,
    nodesByType,
    averageConnections,
    maxDepth: hierarchy.levels.size,
    rootCount: hierarchy.roots.length,
  };
}

// ============================================================================
// MAIN PROCESSOR
// ============================================================================

export interface ProcessedData {
  raw: GraphData;
  indexes: DataIndexes;
  hierarchy: HierarchyInfo;
  tree: TreeNodeData[];
  statistics: DataStatistics;
}

/**
 * Main data processor - creates all optimized data structures
 * Call this once when data is loaded, then use the processed data in UI
 */
export function processGraphData(data: GraphData): ProcessedData {
  // Build indexes
  const indexes = buildDataIndexes(data);

  // Analyze hierarchy
  const hierarchy = analyzeHierarchy(data, indexes);

  // Build tree
  const tree = buildOptimizedTree(data, indexes, hierarchy);

  // Calculate stats
  const statistics = calculateStatistics(data, indexes, hierarchy);

  return {
    raw: data,
    indexes,
    hierarchy,
    tree,
    statistics,
  };
}
