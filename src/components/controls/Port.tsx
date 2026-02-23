import React, { useCallback, useRef, useState } from 'react';
import type { PortDefinition } from '../../types/index.ts';
import { useSynthStore } from '../../store/synth-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { getSignalColor } from '../../styles/theme-tokens.ts';
import PortTooltip from '../hints/PortTooltip.tsx';

type SignalType = 'audio' | 'cv' | 'gate';
type Direction = 'input' | 'output';

interface PortProps {
  portId: string;
  moduleId: string;
  label: string;
  direction: Direction;
  signal: SignalType;
  portDef?: PortDefinition;
  onPortClick: (
    moduleId: string,
    portId: string,
    direction: Direction,
    signal: SignalType,
    element: HTMLDivElement,
  ) => void;
}

const Port: React.FC<PortProps> = ({
  portId,
  moduleId,
  label,
  direction,
  signal,
  portDef,
  onPortClick,
}) => {
  const theme = useTheme();
  const circleRef = useRef<HTMLDivElement>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  // Check if this port has a cable connected
  const isConnected = useSynthStore((s) => {
    return Object.values(s.connections).some(
      (c) =>
        (c.source.moduleId === moduleId && c.source.portId === portId) ||
        (c.dest.moduleId === moduleId && c.dest.portId === portId),
    );
  });

  const handleClick = useCallback(() => {
    if (circleRef.current) {
      onPortClick(moduleId, portId, direction, signal, circleRef.current);
    }
  }, [moduleId, portId, direction, signal, onPortClick]);

  const color = getSignalColor(theme, signal);
  // Connected fill is a brighter/lighter tint than the cable color
  const fillColor = `${color}CC`;
  const size = theme.portSize;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: direction === 'input' ? 'row' : 'row-reverse',
        alignItems: 'center',
        gap: 4,
        userSelect: 'none',
      }}
      onMouseEnter={() => {
        if (circleRef.current && portDef) {
          setHoverRect(circleRef.current.getBoundingClientRect());
        }
      }}
      onMouseLeave={() => setHoverRect(null)}
    >
      <div
        ref={circleRef}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          backgroundColor: isConnected ? fillColor : theme.bgApp,
          border: `2px solid ${color}`,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isConnected ? `0 0 6px ${color}40` : 'none',
        }}
        data-port-id={`${moduleId}:${portId}`}
        onClick={handleClick}
        onMouseEnter={(e) => {
          if (!isConnected) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor = `${color}30`;
          }
        }}
        onMouseLeave={(e) => {
          if (!isConnected) {
            (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.bgApp;
          }
        }}
      />
      <span style={{
        color: theme.textSecondary,
        fontSize: 9,
        fontFamily: theme.fontBase,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}>{label}</span>
      {hoverRect && portDef && (
        <PortTooltip anchorRect={hoverRect} port={portDef} />
      )}
    </div>
  );
};

export default Port;
