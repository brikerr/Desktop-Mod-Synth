import React from 'react';
import Tooltip from './Tooltip.tsx';
import type { PortDefinition } from '../../types/index.ts';

interface PortTooltipProps {
  anchorRect: DOMRect;
  port: PortDefinition;
}

const SIGNAL_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  audio: { bg: '#e9456030', text: '#e94560' },
  cv:    { bg: '#4ecdc430', text: '#4ecdc4' },
  gate:  { bg: '#ffe66d30', text: '#ffe66d' },
};

const PortTooltip: React.FC<PortTooltipProps> = ({ anchorRect, port }) => {
  const badge = SIGNAL_BADGE_COLORS[port.signal] ?? { bg: '#ffffff20', text: '#ccc' };

  const suggestions =
    port.direction === 'input' ? port.suggestedSources : port.suggestedTargets;

  return (
    <Tooltip anchorRect={anchorRect} maxWidth={220}>
      {/* Header: name + signal badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color: '#fff', fontSize: 11 }}>{port.name}</span>
        <span
          style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 8,
            background: badge.bg,
            color: badge.text,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {port.signal}
        </span>
      </div>

      {/* Description */}
      {port.description && (
        <div style={{ color: '#a0a0c0', fontSize: 10, marginBottom: suggestions?.length ? 4 : 0 }}>
          {port.description}
        </div>
      )}

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div style={{ color: '#808098', fontSize: 9, fontStyle: 'italic' }}>
          {port.direction === 'input' ? 'Try from: ' : 'Try into: '}
          {suggestions.join(', ')}
        </div>
      )}
    </Tooltip>
  );
};

export default PortTooltip;
