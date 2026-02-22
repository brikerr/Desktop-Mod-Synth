import React, { useCallback, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import type { ModuleType } from '../types/index.ts';
import { Cables } from './Cables.tsx';

// ---------- lazy-import panel map ----------
// Module panels are imported from ./modules/<Name>Panel.tsx.
// A plain object map keyed by ModuleType avoids a giant switch statement.

import VCOPanel from './modules/VCOPanel.tsx';
import VCFPanel from './modules/VCFPanel.tsx';
import VCAPanel from './modules/VCAPanel.tsx';
import EnvelopePanel from './modules/EnvelopePanel.tsx';
import LFOPanel from './modules/LFOPanel.tsx';
import MixerPanel from './modules/MixerPanel.tsx';
import KeyboardPanel from './modules/KeyboardPanel.tsx';
import OutputPanel from './modules/OutputPanel.tsx';
import NoisePanel from './modules/NoisePanel.tsx';
import DelayPanel from './modules/DelayPanel.tsx';
import ReverbPanel from './modules/ReverbPanel.tsx';
import OscilloscopePanel from './modules/OscilloscopePanel.tsx';

const PANEL_MAP: Record<ModuleType, React.ComponentType<{ moduleId: string }>> = {
  vco: VCOPanel,
  vcf: VCFPanel,
  vca: VCAPanel,
  envelope: EnvelopePanel,
  lfo: LFOPanel,
  mixer: MixerPanel,
  keyboard: KeyboardPanel,
  output: OutputPanel,
  noise: NoisePanel,
  delay: DelayPanel,
  reverb: ReverbPanel,
  oscilloscope: OscilloscopePanel,
};

// ---------- constants ----------

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2.0;
const ZOOM_SENSITIVITY = 0.001;

// ---------- styles ----------

const rackStyle: React.CSSProperties = {
  flex: 1,
  overflow: 'hidden',
  position: 'relative',
  // Dot pattern background
  background: `
    radial-gradient(circle, #1a1a3e 1px, transparent 1px),
    #0f0f23
  `,
  backgroundSize: '20px 20px',
};

const canvasStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  transformOrigin: '0 0',
};

// ---------- component ----------

export function Rack() {
  const modules = useSynthStore((s) => s.modules);
  const pendingCable = useSynthStore((s) => s.pendingCable);
  const cancelCable = useSynthStore((s) => s.cancelCable);

  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);

  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const innerRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button === 1) {
        e.preventDefault();
        isPanning.current = true;
        panStart.current = { x: e.clientX, y: e.clientY, panX, panY };
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      if (e.button === 0 && pendingCable) {
        const target = e.target as HTMLElement;
        if (target === e.currentTarget || target === innerRef.current) {
          cancelCable();
        }
      }
    },
    [panX, panY, pendingCable, cancelCable],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - panStart.current.x;
        const dy = e.clientY - panStart.current.y;
        setPanX(panStart.current.panX + dx);
        setPanY(panStart.current.panY + dy);
      }
    },
    [],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning.current) {
        isPanning.current = false;
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    },
    [],
  );

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * ZOOM_SENSITIVITY;
    setZoom((prev) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev + delta * prev)));
  }, []);

  const moduleList = Object.values(modules);

  return (
    <div
      style={rackStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        ref={innerRef}
        style={{
          ...canvasStyle,
          transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
        }}
      >
        {moduleList.map((mod) => {
          const Panel = PANEL_MAP[mod.type];
          if (!Panel) return null;
          return (
            <div
              key={mod.id}
              style={{ position: 'absolute', left: mod.x, top: mod.y }}
            >
              <Panel moduleId={mod.id} />
            </div>
          );
        })}
        <Cables containerRef={innerRef} />
      </div>
    </div>
  );
}
