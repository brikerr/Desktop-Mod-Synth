import React, { useLayoutEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from '../../store/theme-store.ts';

interface TooltipProps {
  anchorRect: DOMRect;
  children: React.ReactNode;
  maxWidth?: number;
}

const OFFSET = 8;

const Tooltip: React.FC<TooltipProps> = ({ anchorRect, children, maxWidth = 240 }) => {
  const theme = useTheme();
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

    let top = anchorRect.bottom + OFFSET;
    let left = anchorRect.left + anchorRect.width / 2 - tipW / 2;

    if (top + tipH > vh - 8) {
      top = anchorRect.top - tipH - OFFSET;
    }

    if (left < 8) left = 8;
    if (left + tipW > vw - 8) left = vw - 8 - tipW;

    setPos({ top, left });
    setVisible(true);
  }, [anchorRect]);

  return ReactDOM.createPortal(
    <div ref={ref} style={{
      position: 'fixed',
      top: pos.top,
      left: pos.left,
      maxWidth,
      background: theme.glassBg,
      border: `1px solid ${theme.glassBorder}`,
      borderRadius: 12,
      padding: '8px 12px',
      pointerEvents: 'none',
      zIndex: 10000,
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      boxShadow: theme.glassShadow,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.12s ease',
      fontFamily: theme.fontBase,
      fontSize: theme.fontSize,
      color: theme.textPrimary,
      lineHeight: 1.4,
    }}>
      {children}
    </div>,
    document.body,
  );
};

export default Tooltip;
