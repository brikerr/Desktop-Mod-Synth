import React, { useCallback, useRef, useState } from 'react';
import { useAccentColor } from './ModuleAccentContext.tsx';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  size?: number;
}

function formatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return Math.round(value).toString();
  if (abs >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/** Rotary knob with arc indicator and vertical-drag interaction. */
const Knob: React.FC<KnobProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  size = 48,
}) => {
  const accent = useAccentColor();
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef<{
    startY: number;
    startValue: number;
  } | null>(null);

  const clamp = useCallback(
    (v: number): number => {
      let clamped = Math.max(min, Math.min(max, v));
      if (step !== undefined && step > 0) {
        clamped = Math.round((clamped - min) / step) * step + min;
        clamped = Math.max(min, Math.min(max, clamped));
      }
      return clamped;
    },
    [min, max, step],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragStateRef.current) return;
      const dy = dragStateRef.current.startY - e.clientY;
      const range = max - min;
      const sensitivity = 200; // 200px drag = full range
      const delta = (dy / sensitivity) * range;
      const newValue = clamp(dragStateRef.current.startValue + delta);
      onChange(newValue);
    },
    [max, min, clamp, onChange],
  );

  const handleMouseUp = useCallback(() => {
    dragStateRef.current = null;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragStateRef.current = {
        startY: e.clientY,
        startValue: value,
      };
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [value, handleMouseMove, handleMouseUp],
  );

  // --- Arc geometry ---
  const startAngleDeg = 225; // 7-o'clock position
  const endAngleDeg = -45; // 5-o'clock position
  const totalSweepDeg = 270;

  const fraction = max !== min ? (value - min) / (max - min) : 0;
  const currentAngleDeg = startAngleDeg - fraction * totalSweepDeg;

  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 4;
  const arcRadius = radius - 3;
  const indicatorInner = radius - 10;
  const indicatorOuter = radius - 2;

  const angleToXY = (deg: number, r: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy - r * Math.sin(toRad(deg)),
  });

  // Filled arc path
  const arcStart = angleToXY(startAngleDeg, arcRadius);
  const arcEnd = angleToXY(currentAngleDeg, arcRadius);
  const sweepDeg = startAngleDeg - currentAngleDeg;
  const largeArc = sweepDeg > 180 ? 1 : 0;
  const arcPath =
    sweepDeg > 0.5
      ? `M ${arcStart.x} ${arcStart.y} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${arcEnd.x} ${arcEnd.y}`
      : '';

  // Indicator line
  const indInner = angleToXY(currentAngleDeg, indicatorInner);
  const indOuter = angleToXY(currentAngleDeg, indicatorOuter);

  // Tick marks (11 ticks across 270 degrees)
  const tickCount = 11;
  const tickInner = radius - 1;
  const tickOuter = radius + 1;

  // --- Styles ---
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    userSelect: 'none',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a0a0b0',
    fontSize: 10,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  const valueStyle: React.CSSProperties = {
    color: '#e0e0e0',
    fontSize: 10,
    fontFamily: 'monospace',
    textAlign: 'center',
    lineHeight: 1.2,
  };

  const svgFilter = isDragging ? `drop-shadow(0 0 4px ${accent.primary}80)` : 'none';

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <svg
        width={size}
        height={size}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'ns-resize', filter: svgFilter }}
      >
        {/* Knob body with radial gradient */}
        <defs>
          <radialGradient id={`knob-grad-${label}`} cx="40%" cy="35%">
            <stop offset="0%" stopColor="#3a3a5a" />
            <stop offset="100%" stopColor="#1a1a2e" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={radius} fill={`url(#knob-grad-${label})`} />

        {/* Metallic ring */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#4a4a6a" strokeWidth={1} />

        {/* Tick marks */}
        {Array.from({ length: tickCount }, (_, ti) => {
          const tickFrac = ti / (tickCount - 1);
          const tickAngle = startAngleDeg - tickFrac * totalSweepDeg;
          const p1 = angleToXY(tickAngle, tickInner);
          const p2 = angleToXY(tickAngle, tickOuter);
          return (
            <line
              key={ti}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="#3a3a5a"
              strokeWidth={1}
              strokeLinecap="round"
            />
          );
        })}

        {/* Background track */}
        {(() => {
          const trackStart = angleToXY(startAngleDeg, arcRadius);
          const trackEnd = angleToXY(endAngleDeg, arcRadius);
          return (
            <path
              d={`M ${trackStart.x} ${trackStart.y} A ${arcRadius} ${arcRadius} 0 1 1 ${trackEnd.x} ${trackEnd.y}`}
              fill="none"
              stroke="#1a1a2e"
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })()}

        {/* Filled arc (uses accent color) */}
        {arcPath && (
          <path
            d={arcPath}
            fill="none"
            stroke={accent.primary}
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )}

        {/* Indicator line */}
        <line
          x1={indInner.x}
          y1={indInner.y}
          x2={indOuter.x}
          y2={indOuter.y}
          stroke={accent.primary}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
      <span style={valueStyle}>{formatValue(value)}</span>
    </div>
  );
};

export default Knob;
