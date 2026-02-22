import React, { useCallback, useRef, useState } from 'react';
import { useAccentColor } from './ModuleAccentContext.tsx';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  height?: number;
}

function formatValue(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 100) return Math.round(value).toString();
  if (abs >= 1) return value.toFixed(1);
  return value.toFixed(2);
}

/** Vertical slider with filled track and draggable thumb. */
const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  height = 80,
}) => {
  const accent = useAccentColor();
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const valueFromMouseY = useCallback(
    (clientY: number): number => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const fraction = 1 - (clientY - rect.top) / rect.height;
      const clampedFraction = Math.max(0, Math.min(1, fraction));
      return clamp(min + clampedFraction * (max - min));
    },
    [value, min, max, clamp],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      onChange(valueFromMouseY(e.clientY));
    },
    [onChange, valueFromMouseY],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(true);
      onChange(valueFromMouseY(e.clientY));
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ns-resize';
      document.body.style.userSelect = 'none';
    },
    [onChange, valueFromMouseY, handleMouseMove, handleMouseUp],
  );

  const fraction = max !== min ? (value - min) / (max - min) : 0;
  const trackWidth = 6;
  const thumbWidth = 18;
  const thumbHeight = 4;
  const totalWidth = Math.max(thumbWidth, trackWidth) + 4;

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

  const trackAreaStyle: React.CSSProperties = {
    position: 'relative',
    width: totalWidth,
    height,
    cursor: 'ns-resize',
    display: 'flex',
    justifyContent: 'center',
  };

  const trackStyle: React.CSSProperties = {
    position: 'absolute',
    width: trackWidth,
    height: '100%',
    backgroundColor: '#2a2a4a',
    borderRadius: trackWidth / 2,
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
  };

  const fillHeight = fraction * height;
  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    width: trackWidth,
    height: fillHeight,
    backgroundColor: accent.primary,
    borderRadius: trackWidth / 2,
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  };

  const thumbY = (1 - fraction) * height;
  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    width: thumbWidth,
    height: thumbHeight,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    top: thumbY - thumbHeight / 2,
    left: '50%',
    transform: 'translateX(-50%)',
    boxShadow: isDragging
      ? `0 0 6px ${accent.primary}80, 0 0 3px rgba(0,0,0,0.5)`
      : '0 0 3px rgba(0,0,0,0.5)',
  };

  // Value tooltip shown during drag
  const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    top: thumbY - thumbHeight / 2 - 16,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#1a1a2e',
    color: '#e0e0e0',
    fontSize: 9,
    fontFamily: 'monospace',
    padding: '1px 4px',
    borderRadius: 2,
    border: `1px solid ${accent.primary}40`,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <div
        ref={trackRef}
        style={trackAreaStyle}
        onMouseDown={handleMouseDown}
      >
        <div style={trackStyle} />
        <div style={fillStyle} />
        <div style={thumbStyle} />
        {isDragging && (
          <div style={tooltipStyle}>{formatValue(value)}</div>
        )}
      </div>
      <span style={valueStyle}>{formatValue(value)}</span>
    </div>
  );
};

export default Slider;
