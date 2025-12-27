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

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering node selection
    if (nodeData.onToggle) {
      nodeData.onToggle();
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
          'bg-opacity-90 hover:bg-opacity-100',
          'relative'
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

          {/* Expand/Collapse Button */}
          {nodeData.hasChildren && (
            <button
              onClick={handleToggle}
              className={clsx(
                'absolute -bottom-3 left-1/2 -translate-x-1/2',
                'w-7 h-7 rounded-full',
                'bg-white border-2 shadow-lg',
                'flex items-center justify-center',
                'transition-all duration-200 hover:scale-125 hover:shadow-xl',
                'text-gray-700 font-bold text-sm',
                'cursor-pointer z-10',
                colorClasses.split(' ')[1] // Get border color class
              )}
              title={nodeData.isExpanded ? 'Click to collapse' : `Click to expand ${nodeData.childCount} ${nodeData.childCount === 1 ? 'child' : 'children'}`}
            >
              {nodeData.isExpanded ? '−' : '+'}
            </button>
          )}

          {/* Children Count Indicator (only when collapsed) */}
          {nodeData.hasChildren && !nodeData.isExpanded && (
            <div
              className="mt-2 pt-2 border-t border-white/30 text-center"
              title={`${nodeData.childCount} hidden ${nodeData.childCount === 1 ? 'child' : 'children'}`}
            >
              <span className="text-[10px] opacity-80">
                {nodeData.childCount} {nodeData.childCount === 1 ? 'child' : 'children'} hidden
              </span>
            </div>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </>
  );
}
