import { useState, useEffect } from 'react';
import TreeVisualization from './components/TreeVisualization';
import { loadGraphData, getDataFileFromUrl } from './lib/dataLoader';
import type { GraphData, GraphNode } from './types';

function App() {
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load graph data');
        console.error('Error loading graph:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
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
      {/* Metadata Card */}
      {graphData && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-20 max-w-sm">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{graphData.metadata.title}</h1>
          <p className="text-sm text-gray-600 mb-2">{graphData.metadata.description}</p>
          <p className="text-xs text-gray-500">
            Last updated: {graphData.metadata.lastUpdated}
          </p>
        </div>
      )}

      {/* Tree Visualization */}
      <TreeVisualization
        data={graphData}
        selectedNode={selectedNode}
        onNodeSelect={setSelectedNode}
      />
    </div>
  );
}

export default App;
