import React, { useCallback, useEffect, useRef } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import ModulePanel from '../ModulePanel.tsx';
import type { ThemeTokens } from '../../styles/theme-tokens.ts';

interface SpectrumPanelProps {
  moduleId: string;
}

const CANVAS_W = 200;
const CANVAS_H = 120;

const SpectrumPanel: React.FC<SpectrumPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);
  const theme = useTheme();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrumRef = useRef<Float32Array>(new Float32Array(1024));
  const rafRef = useRef(0);
  const themeRef = useRef<ThemeTokens>(theme);
  const frozenRef = useRef(false);
  themeRef.current = theme;

  useEffect(() => {
    const node = audioEngine.getNode(moduleId);
    if (!node) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'spectrum' && e.data.buffer && !frozenRef.current) {
        spectrumRef.current = new Float32Array(e.data.buffer);
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
      const spectrum = spectrumRef.current;

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

      // Draw spectrum as line (log-frequency x-axis, dB y-axis)
      ctx.strokeStyle = t.scopeWaveform;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const minFreqBin = 1; // Skip DC
      const maxFreqBin = spectrum.length; // 1024 bins
      const logMin = Math.log(minFreqBin);
      const logMax = Math.log(maxFreqBin);

      for (let x = 0; x < CANVAS_W; x++) {
        // Log-scale frequency mapping
        const logFreq = logMin + (x / CANVAS_W) * (logMax - logMin);
        const bin = Math.min(Math.floor(Math.exp(logFreq)), maxFreqBin - 1);

        // Convert to dB (with floor)
        const mag = spectrum[bin] || 0.000001;
        const db = 20 * Math.log10(mag);
        // Map dB range (-80 to 0) to canvas height
        const normalized = Math.max(0, Math.min(1, (db + 80) / 80));
        const y = CANVAS_H - normalized * CANVAS_H;

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
  }, []);

  const handleFreezeToggle = useCallback(() => {
    frozenRef.current = !frozenRef.current;
    updateParam(moduleId, 'freeze', frozenRef.current ? 1 : 0);
  }, [moduleId, updateParam]);

  if (!params) return null;

  const isFrozen = frozenRef.current;

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

export default SpectrumPanel;
