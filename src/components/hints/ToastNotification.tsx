import React from 'react';
import { useToastStore } from '../../store/toast-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { moduleColors } from '../../styles/module-colors.ts';

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);
  const theme = useTheme();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 140,
      right: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => {
        const color = moduleColors[toast.moduleType]?.primary ?? '#888';
        return (
          <div
            key={toast.id}
            style={{
              background: theme.tooltipBg,
              border: `1px solid ${theme.tooltipBorder}`,
              borderLeft: `3px solid ${color}`,
              borderRadius: theme.borderRadius,
              padding: '8px 12px',
              maxWidth: 300,
              fontFamily: theme.fontBase,
              fontSize: theme.fontSize,
              color: theme.textPrimary,
              lineHeight: 1.4,
              pointerEvents: 'auto',
              animation: 'toast-slide-in 0.25s ease-out',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <span>{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.textMuted,
                  cursor: 'pointer',
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close_small</span>
              </button>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default ToastContainer;
