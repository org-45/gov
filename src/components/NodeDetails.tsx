import type { GraphNode } from '../types';
import clsx from 'clsx';

interface NodeDetailsProps {
  node: GraphNode | null;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  executive: 'Executive Branch',
  legislative: 'Legislative Branch',
  judicial: 'Judicial Branch',
  constitutional: 'Constitutional Body',
  ministry: 'Ministry',
  provincial: 'Provincial Government',
  local: 'Local Government',
};

export function NodeDetails({ node, onClose }: NodeDetailsProps) {
  if (!node) return null;

  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl p-6 w-96 max-h-[80vh] overflow-y-auto z-50">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{node.label}</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <span
            className={clsx(
              'inline-block px-3 py-1 rounded-full text-xs font-semibold text-white',
              {
                'bg-executive': node.type === 'executive',
                'bg-legislative': node.type === 'legislative',
                'bg-judicial': node.type === 'judicial',
                'bg-constitutional': node.type === 'constitutional',
                'bg-ministry': node.type === 'ministry',
                'bg-provincial': node.type === 'provincial',
                'bg-local': node.type === 'local',
              }
            )}
          >
            {typeLabels[node.type] || node.type}
          </span>
        </div>

        {node.description && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Description</h3>
            <p className="text-gray-600 text-sm">{node.description}</p>
          </div>
        )}

        {node.currentHolder && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Current Holder</h3>
            <p className="text-gray-600 text-sm">{node.currentHolder}</p>
          </div>
        )}

        {node.metadata && Object.keys(node.metadata).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Additional Information</h3>
            <dl className="space-y-2">
              {Object.entries(node.metadata).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <dt className="text-xs font-medium text-gray-500 capitalize">
                    {key.replace(/_/g, ' ')}
                  </dt>
                  <dd className="text-sm text-gray-700">
                    {typeof value === 'string' && value.startsWith('http') ? (
                      <a
                        href={value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit website →
                      </a>
                    ) : (
                      String(value)
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
