import React from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useToastStore } from '../store/toast-store.ts';
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

const toolbarStyle: React.CSSProperties = {
  height: 48,
  background: '#16213e',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  padding: '0 16px',
  flexShrink: 0,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const buttonBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  color: '#e0e0e0',
  border: '1px solid rgba(255,255,255,0.06)',
  padding: '4px 10px',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 12,
  fontFamily: 'inherit',
  whiteSpace: 'nowrap',
  transition: 'background 0.15s, border-color 0.15s',
};

const buttonDisabled: React.CSSProperties = {
  ...buttonBase,
  opacity: 0.3,
  cursor: 'not-allowed',
};

const audioReadyStyle: React.CSSProperties = {
  color: '#4ecdc4',
  fontSize: 12,
  fontWeight: 600,
  marginRight: 4,
};

const dividerStyle: React.CSSProperties = {
  width: 1,
  height: 24,
  background: '#ffffff15',
  marginLeft: 2,
  marginRight: 2,
};

const groupStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 1,
};

const groupLabelStyle: React.CSSProperties = {
  fontSize: 8,
  color: '#a0a0b060',
  textTransform: 'uppercase',
  letterSpacing: 1,
  lineHeight: 1,
  fontFamily: 'sans-serif',
};

const groupButtonsStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: 3,
};

const startButtonStyle: React.CSSProperties = {
  ...buttonBase,
  background: '#533483',
  border: '1px solid #6b44a0',
  color: '#fff',
  fontWeight: 600,
};

export function Toolbar() {
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const initAudio = useSynthStore((s) => s.initAudio);
  const addModule = useSynthStore((s) => s.addModule);
  const addToast = useToastStore((s) => s.addToast);

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

  return (
    <div style={toolbarStyle}>
      {/* Audio init button */}
      {isAudioReady ? (
        <span style={audioReadyStyle}>Audio Ready</span>
      ) : (
        <button
          style={startButtonStyle}
          onMouseEnter={(e) => {
            (e.currentTarget.style.background = '#6b44a0');
          }}
          onMouseLeave={(e) => {
            (e.currentTarget.style.background = '#533483');
          }}
          onClick={() => initAudio()}
        >
          Start Audio
        </button>
      )}

      <div style={dividerStyle} />

      {/* Grouped module palette */}
      {MODULE_GROUPS.map((group, gi) => (
        <React.Fragment key={group.label}>
          {gi > 0 && <div style={dividerStyle} />}
          <div style={groupStyle}>
            <span style={groupLabelStyle}>{group.label}</span>
            <div style={groupButtonsStyle}>
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
                        ? 'rgba(255,255,255,0.04)'
                        : isHovered
                          ? 'rgba(255,255,255,0.15)'
                          : 'rgba(255,255,255,0.08)',
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
    </div>
  );
}
