import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import type { CableConnection, SignalType } from '../types/index.ts';

// ---------- helpers ----------

const SIGNAL_COLORS: Record<SignalType, string> = {
  audio: '#ff4d6d',
  cv: '#5bf5e8',
  gate: '#ffed4a',
};

interface Point {
  x: number;
  y: number;
}

/**
 * Resolve the center position of a port element identified by
 * `data-port-id="moduleId:portId"`. The returned coordinates are relative to
 * the given `containerEl` so they line up inside the pannable/zoomable SVG.
 */
function getPortPosition(
  moduleId: string,
  portId: string,
  containerEl: HTMLElement | null,
): Point | null {
  if (!containerEl) return null;

  const el = containerEl.querySelector<HTMLElement>(
    `[data-port-id="${moduleId}:${portId}"]`,
  );
  if (!el) return null;

  const portRect = el.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();

  const style = window.getComputedStyle(containerEl);
  const matrix = new DOMMatrix(style.transform);
  const scale = matrix.a || 1;

  return {
    x: (portRect.left + portRect.width / 2 - containerRect.left) / scale,
    y: (portRect.top + portRect.height / 2 - containerRect.top) / scale,
  };
}

/**
 * Build a cubic-bezier path with catenary sag.
 */
function cablePath(a: Point, b: Point): string {
  const dx = Math.abs(b.x - a.x);
  const offset = Math.max(80, dx * 0.4);
  // Catenary sag: cables droop downward based on distance
  const sag = Math.min(80, dx * 0.15 + 20);
  return `M ${a.x},${a.y} C ${a.x + offset},${a.y + sag} ${b.x - offset},${b.y + sag} ${b.x},${b.y}`;
}

// ---------- individual cable ----------

interface CableProps {
  connection: CableConnection;
  containerEl: HTMLElement | null;
  tick: number; // forces re-render on RAF
}

const Cable = React.memo(function Cable({
  connection,
  containerEl,
  tick: _tick,
}: CableProps) {
  const removeConnection = useSynthStore((s) => s.removeConnection);
  const src = getPortPosition(
    connection.source.moduleId,
    connection.source.portId,
    containerEl,
  );
  const dst = getPortPosition(
    connection.dest.moduleId,
    connection.dest.portId,
    containerEl,
  );

  if (!src || !dst) return null;

  const color = SIGNAL_COLORS[connection.signalType];

  return (
    <g>
      {/* Glow layer */}
      <path
        d={cablePath(src, dst)}
        stroke={color}
        strokeWidth={6}
        fill="none"
        opacity={0.15}
        filter="url(#cable-glow)"
        style={{ pointerEvents: 'none' }}
      />
      {/* Main cable */}
      <path
        d={cablePath(src, dst)}
        stroke={color}
        strokeWidth={3}
        fill="none"
        opacity={0.85}
        className="cable-line"
        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
        onClick={(e) => {
          e.stopPropagation();
          removeConnection(connection.id);
        }}
      />
    </g>
  );
});

// ---------- pending cable ----------

interface PendingCableProps {
  containerEl: HTMLElement | null;
  tick: number;
}

function PendingCable({ containerEl, tick: _tick }: PendingCableProps) {
  const pendingCable = useSynthStore((s) => s.pendingCable);
  const [mouse, setMouse] = useState<Point>({ x: 0, y: 0 });

  useEffect(() => {
    if (!pendingCable || !containerEl) return;

    function handleMove(e: MouseEvent) {
      const rect = containerEl!.getBoundingClientRect();
      const style = window.getComputedStyle(containerEl!);
      const matrix = new DOMMatrix(style.transform);
      const scale = matrix.a || 1;

      setMouse({
        x: (e.clientX - rect.left) / scale,
        y: (e.clientY - rect.top) / scale,
      });
    }

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [pendingCable, containerEl]);

  if (!pendingCable || !containerEl) return null;

  const src = getPortPosition(
    pendingCable.source.moduleId,
    pendingCable.source.portId,
    containerEl,
  );
  if (!src) return null;

  const color = SIGNAL_COLORS[pendingCable.signalType];

  return (
    <path
      d={cablePath(src, mouse)}
      stroke={color}
      strokeWidth={3}
      fill="none"
      opacity={0.5}
      strokeDasharray="8 4"
      style={{ pointerEvents: 'none' }}
    />
  );
}

// ---------- main overlay ----------

interface CablesProps {
  /** Reference to the pannable/zoomable inner container so we can measure port positions. */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function Cables({ containerRef }: CablesProps) {
  const connections = useSynthStore((s) => s.connections);
  const modules = useSynthStore((s) => s.modules);

  // Tick counter driven by RAF to re-measure port positions when modules move.
  const [tick, setTick] = useState(0);
  const rafRef = useRef(0);
  const prevModulesRef = useRef(modules);

  useEffect(() => {
    const changed =
      modules !== prevModulesRef.current ||
      Object.keys(modules).length !== Object.keys(prevModulesRef.current).length;

    prevModulesRef.current = modules;

    if (!changed) return;

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTick((t) => t + 1);
    });

    return () => cancelAnimationFrame(rafRef.current);
  }, [modules]);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      setTick((t) => t + 1);
    });
    return () => cancelAnimationFrame(rafRef.current);
  }, [connections]);

  const containerEl = containerRef.current;
  const connectionList = Object.values(connections);

  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible',
      }}
    >
      <defs>
        <filter id="cable-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {connectionList.map((conn) => (
        <Cable
          key={conn.id}
          connection={conn}
          containerEl={containerEl}
          tick={tick}
        />
      ))}
      <PendingCable containerEl={containerEl} tick={tick} />
    </svg>
  );
}
