import React, { useEffect, useRef } from 'react';
import { useTheme } from '../store/theme-store.ts';

// Soft drifting gradient blobs rendered on a canvas, very subtle
// Inspired by Framer's "Ambient Background" component

interface Blob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

function createBlobs(width: number, height: number, colors: string[]): Blob[] {
  return colors.map((color, i) => ({
    x: width * (0.2 + 0.6 * (i / (colors.length - 1 || 1))),
    y: height * (0.3 + 0.4 * ((i % 2 === 0) ? 0 : 1)),
    vx: (0.15 + Math.random() * 0.1) * (i % 2 === 0 ? 1 : -1),
    vy: (0.1 + Math.random() * 0.1) * (i % 3 === 0 ? -1 : 1),
    radius: Math.min(width, height) * (0.35 + i * 0.05),
    color,
  }));
}

export const AmbientBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const animRef = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);
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
      // Use lower resolution for performance
      const dpr = 0.5;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.scale(dpr, dpr);
      sizeRef.current = { w, h };
      blobsRef.current = createBlobs(w, h, blobColors);
    }

    // Muted, theme-appropriate blob colors
    const isDark = theme.bgApp === '#191919';
    const blobColors = isDark
      ? [
          'rgba(40, 60, 80, 0.4)',
          'rgba(60, 40, 70, 0.35)',
          'rgba(30, 70, 60, 0.3)',
        ]
      : [
          'rgba(180, 200, 220, 0.35)',
          'rgba(200, 180, 210, 0.3)',
          'rgba(180, 210, 200, 0.3)',
        ];

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    function draw() {
      const { w, h } = sizeRef.current;
      const blobs = blobsRef.current;

      // Clear with base color
      ctx!.clearRect(0, 0, w, h);

      // Update and draw blobs
      for (const blob of blobs) {
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Soft bounce off edges
        if (blob.x < -blob.radius * 0.3) blob.vx = Math.abs(blob.vx);
        if (blob.x > w + blob.radius * 0.3) blob.vx = -Math.abs(blob.vx);
        if (blob.y < -blob.radius * 0.3) blob.vy = Math.abs(blob.vy);
        if (blob.y > h + blob.radius * 0.3) blob.vy = -Math.abs(blob.vy);

        const gradient = ctx!.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius,
        );
        gradient.addColorStop(0, blob.color);
        gradient.addColorStop(1, 'transparent');

        ctx!.fillStyle = gradient;
        ctx!.fillRect(0, 0, w, h);
      }

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
