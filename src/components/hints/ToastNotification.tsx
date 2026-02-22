import React from 'react';
import { useToastStore } from '../../store/toast-store.ts';
import { moduleColors } from '../../styles/module-colors.ts';

const containerStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 140,
  right: 16,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  zIndex: 9999,
  pointerEvents: 'none',
};

const ToastContainer: React.FC = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div style={containerStyle}>
      {toasts.map((toast) => {
        const color = moduleColors[toast.moduleType]?.primary ?? '#888';
        return (
          <div
            key={toast.id}
            style={{
              background: '#1a1a2eee',
              border: '1px solid rgba(255,255,255,0.1)',
              borderLeft: `3px solid ${color}`,
              borderRadius: 6,
              padding: '8px 12px',
              maxWidth: 300,
              boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
              fontFamily: 'sans-serif',
              fontSize: 11,
              color: '#d0d0e0',
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
                  color: '#808098',
                  cursor: 'pointer',
                  fontSize: 14,
                  lineHeight: 1,
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                ×
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
