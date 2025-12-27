import { useState, useEffect, useMemo } from 'react';
import TreeVisualization from './components/TreeVisualization';
import { loadGraphData, getDataFileFromUrl } from './lib/dataLoader';
import { processGraphData, type ProcessedData } from './lib/dataProcessor';
import type { GraphNode } from './types';

function App() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Load raw data
        const dataFile = getDataFileFromUrl();
        const rawData = await loadGraphData(dataFile);

        // Process data into optimized structures
        const processed = processGraphData(rawData);
        setProcessedData(processed);

        console.log('Data processed:', {
          nodes: processed.statistics.totalNodes,
          edges: processed.statistics.totalEdges,
          roots: processed.hierarchy.roots.length,
          maxDepth: processed.statistics.maxDepth,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
        console.error('Error loading graph:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Memoize metadata to avoid re-renders
  const metadata = useMemo(() => processedData?.raw.metadata, [processedData]);

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
      {/* Metadata Card */}
      {metadata && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{metadata.title}</h1>
          <p className="text-sm text-gray-600 mb-2">{metadata.description}</p>
          <p className="text-xs text-gray-500">
            Last updated: {metadata.lastUpdated}
          </p>
          {processedData && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {processedData.statistics.totalNodes} nodes • {processedData.statistics.totalEdges} connections
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tree Visualization */}
      {processedData && (
        <TreeVisualization
          processedData={processedData}
          selectedNode={selectedNode}
          onNodeSelect={setSelectedNode}
        />
      )}
    </div>
  );
}

export default App;
