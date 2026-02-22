import React, { useCallback, useEffect, useRef } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface OscilloscopePanelProps {
  moduleId: string;
}

const CANVAS_W = 200;
const CANVAS_H = 120;

const OscilloscopePanel: React.FC<OscilloscopePanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<Float32Array>(new Float32Array(2048));
  const rafRef = useRef(0);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  // Listen for waveform data from the processor
  useEffect(() => {
    const node = audioEngine.getNode(moduleId);
    if (!node) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'waveform' && e.data.buffer) {
        waveformRef.current = new Float32Array(e.data.buffer);
      }
    };

    node.port.onmessage = handleMessage;
    return () => {
      node.port.onmessage = null;
    };
  }, [moduleId]);

  // Animation loop — draws directly to canvas, no React re-renders
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!ctx) return;
      const waveform = waveformRef.current;
      const trigLevel = params?.triggerLevel ?? 0;

      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid lines
      ctx.strokeStyle = '#1a2a3a';
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx < CANVAS_W; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, CANVAS_H);
        ctx.stroke();
      }
      for (let gy = 0; gy < CANVAS_H; gy += 30) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(CANVAS_W, gy);
        ctx.stroke();
      }

      // Center line
      ctx.strokeStyle = '#2a3a4a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2);
      ctx.lineTo(CANVAS_W, CANVAS_H / 2);
      ctx.stroke();

      // Trigger level line
      const trigY = CANVAS_H / 2 - trigLevel * (CANVAS_H / 2);
      ctx.strokeStyle = '#ff4d6d33';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trigY);
      ctx.lineTo(CANVAS_W, trigY);
      ctx.stroke();

      // Find trigger point (rising edge crossing triggerLevel)
      let triggerIdx = 0;
      for (let i = 1; i < waveform.length - CANVAS_W; i++) {
        if (waveform[i - 1] <= trigLevel && waveform[i] > trigLevel) {
          triggerIdx = i;
          break;
        }
      }

      // Draw waveform
      ctx.strokeStyle = '#00ff88';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 4;
      ctx.beginPath();

      for (let x = 0; x < CANVAS_W; x++) {
        const sampleIdx = triggerIdx + x;
        const sample = sampleIdx < waveform.length ? waveform[sampleIdx] : 0;
        const y = CANVAS_H / 2 - sample * (CANVAS_H / 2) * 0.9;
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params?.triggerLevel]);

  // Freeze toggle
  const handleFreezeToggle = useCallback(() => {
    const newValue = (params?.freeze ?? 0) > 0.5 ? 0 : 1;
    updateParam(moduleId, 'freeze', newValue);
    // Also send via message port for immediate response
    const node = audioEngine.getNode(moduleId);
    if (node) {
      node.port.postMessage({ type: 'freeze', value: newValue === 1 });
    }
  }, [moduleId, params?.freeze, updateParam]);

  if (!params) return null;

  const canvasStyle: React.CSSProperties = {
    borderRadius: 4,
    border: '1px solid #1a2a3a',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  const freezeStyle: React.CSSProperties = {
    background: params.freeze > 0.5 ? '#ff4d6d' : '#2a2a4a',
    color: '#e0e0e0',
    border: '1px solid #333366',
    borderRadius: 3,
    padding: '2px 8px',
    fontSize: 10,
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={canvasStyle}
      />
      <div style={rowStyle}>
        <Knob label="Time/Div" value={params.timeDiv} min={1} max={50} step={1} onChange={set('timeDiv')} />
        <Knob label="Trigger" value={params.triggerLevel} min={-1} max={1} step={0.01} onChange={set('triggerLevel')} />
      </div>
      <button style={freezeStyle} onClick={handleFreezeToggle}>
        {params.freeze > 0.5 ? 'Frozen' : 'Freeze'}
      </button>
    </ModulePanel>
  );
};

export default OscilloscopePanel;
