import React, { useCallback, useEffect, useRef } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import type { ThemeTokens } from '../../styles/theme-tokens.ts';

interface OscilloscopePanelProps {
  moduleId: string;
}

const CANVAS_W = 200;
const CANVAS_H = 120;

const OscilloscopePanel: React.FC<OscilloscopePanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);
  const theme = useTheme();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveformRef = useRef<Float32Array>(new Float32Array(2048));
  const rafRef = useRef(0);
  const themeRef = useRef<ThemeTokens>(theme);
  themeRef.current = theme;

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function draw() {
      if (!ctx) return;
      const t = themeRef.current;
      const waveform = waveformRef.current;
      const trigLevel = params?.triggerLevel ?? 0;

      ctx.fillStyle = t.scopeBg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Grid lines
      ctx.strokeStyle = t.scopeGrid;
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
      ctx.strokeStyle = t.scopeCenter;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_H / 2);
      ctx.lineTo(CANVAS_W, CANVAS_H / 2);
      ctx.stroke();

      // Trigger level line
      const trigY = CANVAS_H / 2 - trigLevel * (CANVAS_H / 2);
      ctx.strokeStyle = t.scopeTrigger;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, trigY);
      ctx.lineTo(CANVAS_W, trigY);
      ctx.stroke();

      // Find trigger point
      let triggerIdx = 0;
      for (let i = 1; i < waveform.length - CANVAS_W; i++) {
        if (waveform[i - 1] <= trigLevel && waveform[i] > trigLevel) {
          triggerIdx = i;
          break;
        }
      }

      // Draw waveform — no glow
      ctx.strokeStyle = t.scopeWaveform;
      ctx.lineWidth = 2;
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

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [params?.triggerLevel]);

  const handleFreezeToggle = useCallback(() => {
    const newValue = (params?.freeze ?? 0) > 0.5 ? 0 : 1;
    updateParam(moduleId, 'freeze', newValue);
    const node = audioEngine.getNode(moduleId);
    if (node) {
      node.port.postMessage({ type: 'freeze', value: newValue === 1 });
    }
  }, [moduleId, params?.freeze, updateParam]);

  if (!params) return null;

  const isFrozen = params.freeze > 0.5;

  return (
    <ModulePanel moduleId={moduleId}>
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        style={{
          borderRadius: theme.borderRadius,
          border: `1px solid ${theme.borderSubtle}`,
        }}
      />
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 14,
        alignItems: 'flex-start',
        justifyContent: 'center',
      }}>
        <Knob label="Time/Div" value={params.timeDiv} min={1} max={50} step={1} onChange={set('timeDiv')} />
        <Knob label="Trigger" value={params.triggerLevel} min={-1} max={1} step={0.01} onChange={set('triggerLevel')} />
      </div>
      <button
        style={{
          background: isFrozen ? theme.accent : theme.bgControl,
          color: isFrozen ? '#fff' : theme.textPrimary,
          border: `1px solid ${theme.borderControl}`,
          borderRadius: theme.borderRadius,
          padding: '2px 8px',
          fontSize: theme.fontSizeLabel,
          cursor: 'pointer',
          fontFamily: theme.fontBase,
        }}
        onClick={handleFreezeToggle}
      >
        {isFrozen ? 'Frozen' : 'Freeze'}
      </button>
    </ModulePanel>
  );
};

export default OscilloscopePanel;
