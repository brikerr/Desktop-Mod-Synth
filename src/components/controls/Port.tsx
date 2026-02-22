import React, { useCallback, useRef, useState } from 'react';
import type { PortDefinition } from '../../types/index.ts';
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

const SIGNAL_COLORS: Record<SignalType, string> = {
  audio: '#e94560',
  cv: '#4ecdc4',
  gate: '#ffe66d',
};

/** Jack/port circle for patch cable connections. */
const Port: React.FC<PortProps> = ({
  portId,
  moduleId,
  label,
  direction,
  signal,
  portDef,
  onPortClick,
}) => {
  const circleRef = useRef<HTMLDivElement>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  const handleClick = useCallback(() => {
    if (circleRef.current) {
      onPortClick(moduleId, portId, direction, signal, circleRef.current);
    }
  }, [moduleId, portId, direction, signal, onPortClick]);

  const color = SIGNAL_COLORS[signal];

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction === 'input' ? 'row' : 'row-reverse',
    alignItems: 'center',
    gap: 4,
    userSelect: 'none',
  };

  const circleStyle: React.CSSProperties = {
    width: 16,
    height: 16,
    borderRadius: '50%',
    backgroundColor: '#1a1a2e',
    border: `2px solid ${color}`,
    boxShadow: `0 0 4px ${color}80, inset 0 0 3px ${color}40`,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'box-shadow 0.15s ease',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a0a0b0',
    fontSize: 9,
    fontFamily: 'sans-serif',
    whiteSpace: 'nowrap',
    lineHeight: 1.2,
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={() => {
        if (circleRef.current && portDef) {
          setHoverRect(circleRef.current.getBoundingClientRect());
        }
      }}
      onMouseLeave={() => setHoverRect(null)}
    >
      <div
        ref={circleRef}
        style={circleStyle}
        data-port-id={`${moduleId}:${portId}`}
        onClick={handleClick}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 8px ${color}cc, inset 0 0 4px ${color}60`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            `0 0 4px ${color}80, inset 0 0 3px ${color}40`;
        }}
      />
      <span style={labelStyle}>{label}</span>
      {hoverRect && portDef && (
        <PortTooltip anchorRect={hoverRect} port={portDef} />
      )}
    </div>
  );
};

export default Port;
