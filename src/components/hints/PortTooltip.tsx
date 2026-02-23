import React from 'react';
import Tooltip from './Tooltip.tsx';
import { useTheme } from '../../store/theme-store.ts';
import { getSignalColor, getSignalBg } from '../../styles/theme-tokens.ts';
import type { PortDefinition } from '../../types/index.ts';

interface PortTooltipProps {
  anchorRect: DOMRect;
  port: PortDefinition;
}

const PortTooltip: React.FC<PortTooltipProps> = ({ anchorRect, port }) => {
  const theme = useTheme();
  const badgeBg = getSignalBg(theme, port.signal);
  const badgeText = getSignalColor(theme, port.signal);

  const suggestions =
    port.direction === 'input' ? port.suggestedSources : port.suggestedTargets;

  return (
    <Tooltip anchorRect={anchorRect} maxWidth={220}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
        <span style={{ fontWeight: 600, color: theme.textPrimary, fontSize: theme.fontSize }}>{port.name}</span>
        <span
          style={{
            fontSize: 9,
            padding: '1px 5px',
            borderRadius: 8,
            background: badgeBg,
            color: badgeText,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {port.signal}
        </span>
      </div>

      {port.description && (
        <div style={{ color: theme.textSecondary, fontSize: theme.fontSizeLabel, marginBottom: suggestions?.length ? 4 : 0 }}>
          {port.description}
        </div>
      )}

      {suggestions && suggestions.length > 0 && (
        <div style={{ color: theme.textMuted, fontSize: 9, fontStyle: 'italic' }}>
          {port.direction === 'input' ? 'Try from: ' : 'Try into: '}
          {suggestions.join(', ')}
        </div>
      )}
    </Tooltip>
  );
};

export default PortTooltip;
