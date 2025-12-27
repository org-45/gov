import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { CustomNodeData } from '../types';
import clsx from 'clsx';

const nodeTypeColors: Record<string, string> = {
  executive: 'bg-executive border-executive',
  legislative: 'bg-legislative border-legislative',
  judicial: 'bg-judicial border-judicial',
  constitutional: 'bg-constitutional border-constitutional',
  ministry: 'bg-ministry border-ministry',
  provincial: 'bg-provincial border-provincial',
  local: 'bg-local border-local',
};

export function CustomNode({ data }: NodeProps) {
  const nodeData = data as CustomNodeData;

  const handleClick = () => {
    if (nodeData.onNodeClick) {
      nodeData.onNodeClick(nodeData);
    }
  };

  const colorClasses = nodeTypeColors[nodeData.type] || 'bg-gray-500 border-gray-500';

  return (
    <>
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div
        onClick={handleClick}
        className={clsx(
          'px-4 py-3 rounded-lg border-2 shadow-md cursor-pointer',
          'transition-all duration-200 hover:shadow-lg hover:scale-105',
          'min-w-[200px] max-w-[250px]',
          colorClasses,
          'bg-opacity-90 hover:bg-opacity-100'
        )}
      >
        <div className="text-white">
          <div className="font-bold text-sm mb-1">{nodeData.label}</div>
          {nodeData.description && (
            <div className="text-xs opacity-90 line-clamp-2">{nodeData.description}</div>
          )}
          {nodeData.currentHolder && (
            <div className="text-xs mt-1 opacity-80 italic">{nodeData.currentHolder}</div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </>
  );
}
