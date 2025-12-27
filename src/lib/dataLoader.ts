import type { GraphData } from '../types';

export async function loadGraphData(dataFile: string = 'nepal-government'): Promise<GraphData> {
  try {
    const response = await fetch(`/data/${dataFile}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`);
    }
    const data = await response.json();
    validateGraphData(data);
    return data;
  } catch (error) {
    console.error('Error loading graph data:', error);
    throw error;
  }
}

function validateGraphData(data: unknown): asserts data is GraphData {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data format: expected an object');
  }

  const graphData = data as Partial<GraphData>;

  if (!graphData.metadata) {
    throw new Error('Missing required field: metadata');
  }

  if (!graphData.nodes || !Array.isArray(graphData.nodes)) {
    throw new Error('Missing or invalid field: nodes (expected array)');
  }

  if (!graphData.edges || !Array.isArray(graphData.edges)) {
    throw new Error('Missing or invalid field: edges (expected array)');
  }

  for (const node of graphData.nodes) {
    if (!node.id || !node.label || !node.type) {
      throw new Error(`Invalid node: missing required fields (id, label, type)`);
    }
  }

  for (const edge of graphData.edges) {
    if (!edge.from || !edge.to) {
      throw new Error(`Invalid edge: missing required fields (from, to)`);
    }
  }
}

// Mapping of subdomains to data files
const subdomainToDataFile: Record<string, string> = {
  'nepal': 'nepal-government',
  'usa': 'usa-government',
  'uk': 'uk-government',
  'india': 'india-government',
  'china': 'china-government',
};

export function getDataFileFromUrl(): string {
  // First, check if there's a subdomain
  const hostname = window.location.hostname;

  // Extract subdomain (e.g., 'nepal' from 'nepal.visualize-gov.pages.dev')
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    // If hostname is like 'nepal.visualize-gov.pages.dev' or 'nepal.localhost'
    const subdomain = parts[0];
    if (subdomainToDataFile[subdomain]) {
      return subdomainToDataFile[subdomain];
    }
  }

  // Fall back to URL parameter
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get('data');
  if (dataParam) {
    return dataParam;
  }

  // Default to Nepal
  return 'nepal-government';
}

export function getCountryFromDataFile(dataFile: string): string {
  // Reverse lookup: find the subdomain key for the data file
  for (const [subdomain, file] of Object.entries(subdomainToDataFile)) {
    if (file === dataFile) {
      return subdomain;
    }
  }
  return 'nepal';
}
