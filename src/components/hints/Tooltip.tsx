import React, { useLayoutEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';

interface TooltipProps {
  anchorRect: DOMRect;
  children: React.ReactNode;
  maxWidth?: number;
}

const OFFSET = 8;

const Tooltip: React.FC<TooltipProps> = ({ anchorRect, children, maxWidth = 240 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const tipW = el.offsetWidth;
    const tipH = el.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Default: below + centered on anchor
    let top = anchorRect.bottom + OFFSET;
    let left = anchorRect.left + anchorRect.width / 2 - tipW / 2;

    // Flip above if too close to bottom
    if (top + tipH > vh - 8) {
      top = anchorRect.top - tipH - OFFSET;
    }

    // Clamp horizontal
    if (left < 8) left = 8;
    if (left + tipW > vw - 8) left = vw - 8 - tipW;

    setPos({ top, left });
    setVisible(true);
  }, [anchorRect]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: pos.top,
    left: pos.left,
    maxWidth,
    background: '#1a1a2e',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 6,
    padding: '6px 10px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
    pointerEvents: 'none',
    zIndex: 10000,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.12s ease',
    fontFamily: 'sans-serif',
    fontSize: 11,
    color: '#d0d0e0',
    lineHeight: 1.4,
  };

  return ReactDOM.createPortal(
    <div ref={ref} style={style}>
      {children}
    </div>,
    document.body,
  );
};

export default Tooltip;
