import React from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useToastStore } from '../store/toast-store.ts';
import { useTheme, useThemeStore } from '../store/theme-store.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
import { hasShownTip, markTipShown } from '../hooks/useFirstAddTracker.ts';
import type { ModuleType } from '../types/index.ts';

interface ModuleGroup {
  label: string;
  modules: { type: ModuleType; label: string }[];
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: 'Sources',
    modules: [
      { type: 'vco', label: 'VCO' },
      { type: 'noise', label: 'Noise' },
      { type: 'lfo', label: 'LFO' },
      { type: 'keyboard', label: 'Keyboard' },
    ],
  },
  {
    label: 'Processing',
    modules: [
      { type: 'vcf', label: 'VCF' },
      { type: 'vca', label: 'VCA' },
      { type: 'mixer', label: 'Mixer' },
      { type: 'envelope', label: 'Envelope' },
    ],
  },
  {
    label: 'Effects',
    modules: [
      { type: 'delay', label: 'Delay' },
      { type: 'reverb', label: 'Reverb' },
    ],
  },
  {
    label: 'Utility',
    modules: [
      { type: 'oscilloscope', label: 'Scope' },
      { type: 'output', label: 'Output' },
    ],
  },
];

export function Toolbar() {
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const initAudio = useSynthStore((s) => s.initAudio);
  const addModule = useSynthStore((s) => s.addModule);
  const addToast = useToastStore((s) => s.addToast);
  const theme = useTheme();
  const themeName = useThemeStore((s) => s.themeName);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const handleAddModule = React.useCallback((type: ModuleType) => {
    addModule(type);
    if (!hasShownTip(type)) {
      const def = getModuleDefinition(type);
      if (def.firstAddTip) {
        addToast(def.firstAddTip, type);
      }
      markTipShown(type);
    }
  }, [addModule, addToast]);

  const [hoveredKey, setHoveredKey] = React.useState<string | null>(null);

  const buttonBase: React.CSSProperties = {
    background: theme.bgControl,
    color: theme.textPrimary,
    border: `1px solid ${theme.borderSubtle}`,
    padding: '6px 14px',
    borderRadius: theme.borderRadius,
    cursor: 'pointer',
    fontSize: 12,
    fontFamily: theme.fontBase,
    whiteSpace: 'nowrap',
    transition: 'background 0.1s',
  };

  const buttonDisabled: React.CSSProperties = {
    ...buttonBase,
    opacity: 0.3,
    cursor: 'not-allowed',
  };

  return (
    <div style={{
      height: 56,
      background: theme.bgToolbar,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: '0 20px',
      flexShrink: 0,
      borderBottom: `1px solid ${theme.borderSubtle}`,
    }}>
      {isAudioReady ? (
        <span style={{
          color: theme.audioReady,
          fontSize: 12,
          fontWeight: 600,
          fontFamily: theme.fontBase,
          marginRight: 6,
        }}>Audio Ready</span>
      ) : (
        <button
          style={{
            ...buttonBase,
            background: theme.accent,
            border: `1px solid ${theme.accentHover}`,
            color: '#fff',
            fontWeight: 600,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.accentHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.accent;
          }}
          onClick={() => initAudio()}
        >
          Start Audio
        </button>
      )}

      <div style={{ width: 1, height: 28, background: theme.borderSubtle, marginLeft: 4, marginRight: 4 }} />

      {MODULE_GROUPS.map((group, gi) => (
        <React.Fragment key={group.label}>
          {gi > 0 && (
            <div style={{ width: 1, height: 28, background: theme.borderSubtle, marginLeft: 4, marginRight: 4 }} />
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <span style={{
              fontSize: 9,
              color: theme.textMuted,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
              lineHeight: 1,
              fontFamily: theme.fontBase,
            }}>{group.label}</span>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 5 }}>
              {group.modules.map((m) => {
                const disabled = !isAudioReady;
                const isHovered = hoveredKey === m.type && !disabled;

                return (
                  <button
                    key={m.type}
                    disabled={disabled}
                    style={{
                      ...(disabled ? buttonDisabled : buttonBase),
                      background: disabled
                        ? `${theme.bgControl}66`
                        : isHovered
                          ? theme.borderControl
                          : theme.bgControl,
                    }}
                    onMouseEnter={() => setHoveredKey(m.type)}
                    onMouseLeave={() => setHoveredKey(null)}
                    onClick={() => handleAddModule(m.type)}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </React.Fragment>
      ))}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Theme toggle */}
      <button
        style={{
          ...buttonBase,
          fontSize: 16,
          padding: '2px 8px',
          lineHeight: 1,
        }}
        onClick={toggleTheme}
        title={`Switch to ${themeName === 'dark' ? 'light' : 'dark'} mode`}
      >
        {themeName === 'dark' ? '\u263C' : '\u263E'}
      </button>
    </div>
  );
}
