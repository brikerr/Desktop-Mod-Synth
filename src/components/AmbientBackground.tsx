import React, { useEffect, useRef } from 'react';
import { useTheme } from '../store/theme-store.ts';

// Single soft gradient wash that slowly shifts position

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const animRef = useRef<number>(0);
  const angleRef = useRef(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      const dpr = 0.5;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w, h };
    }

    const isDark = theme.bgApp === '#191919';
    const color = isDark
      ? 'rgba(35, 50, 70, 0.5)'
      : 'rgba(170, 190, 215, 0.4)';

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    function draw() {
      const { w, h } = sizeRef.current;

      ctx!.clearRect(0, 0, w, h);

      // Slowly drifting center point
      angleRef.current += 0.002;
      const cx = w * 0.5 + Math.cos(angleRef.current) * w * 0.15;
      const cy = h * 0.5 + Math.sin(angleRef.current * 0.7) * h * 0.15;
      const radius = Math.max(w, h) * 0.7;

      const gradient = ctx!.createRadialGradient(cx, cy, 0, cx, cy, radius);
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'transparent');

      ctx!.fillStyle = gradient;
      ctx!.fillRect(0, 0, w, h);

      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [theme.bgApp]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};
