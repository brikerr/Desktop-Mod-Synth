import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { audioEngine } from '../../audio/engine.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface StepSequencerPanelProps {
  moduleId: string;
}

const stepCountOptions = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: 6, label: '6' },
  { value: 7, label: '7' },
  { value: 8, label: '8' },
];

const StepSequencerPanel: React.FC<StepSequencerPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const activeStepRef = useRef(0);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  useEffect(() => {
    const node = audioEngine.getNode(moduleId);
    if (!node) return;

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'stepChange') {
        activeStepRef.current = e.data.step;
        setActiveStep(e.data.step);
      }
    };

    node.port.onmessage = handleMessage;
    return () => {
      node.port.onmessage = null;
    };
  }, [moduleId]);

  if (!params) return null;

  const stepCount = Math.round(params.steps ?? 8);

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 3,
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {Array.from({ length: 8 }, (_, i) => {
          const isActive = i === activeStep;
          const isEnabled = i < stepCount;
          const stepKey = `step${i}` as string;
          const value = params[stepKey] ?? 0;
          // Map -2..2 to 0..1 for visual height
          const heightPct = ((value + 2) / 4) * 100;

          return (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                opacity: isEnabled ? 1 : 0.3,
              }}
            >
              <div
                style={{
                  width: 20,
                  height: 60,
                  background: theme.bgControl,
                  border: `1px solid ${isActive ? theme.accent : theme.borderSubtle}`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isEnabled ? 'pointer' : 'default',
                }}
                onPointerDown={(e) => {
                  if (!isEnabled) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const onMove = (ev: PointerEvent) => {
                    const y = Math.max(0, Math.min(1, 1 - (ev.clientY - rect.top) / rect.height));
                    const cv = y * 4 - 2; // Map 0..1 to -2..2
                    updateParam(moduleId, stepKey, Math.round(cv * 100) / 100);
                  };
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                  };
                  onMove(e.nativeEvent);
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
              >
                {/* Fill bar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${heightPct}%`,
                    background: isActive ? theme.accent : theme.borderControl,
                    transition: 'background 0.1s',
                  }}
                />
              </div>
              <span style={{
                fontSize: 8,
                color: isActive ? theme.accent : theme.textMuted,
                fontFamily: theme.fontBase,
              }}>
                {i + 1}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: 10,
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <Knob label="Gate Len" value={params.gateLength} min={0.1} max={0.9} step={0.01} onChange={set('gateLength')} />
        <Select label="Steps" value={params.steps} options={stepCountOptions} onChange={set('steps')} />
      </div>
    </ModulePanel>
  );
};

export default StepSequencerPanel;
