import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface VCOPanelProps {
  moduleId: string;
}

const waveformOptions = [
  { value: 0, label: 'Sine' },
  { value: 1, label: 'Saw' },
  { value: 2, label: 'Square' },
  { value: 3, label: 'Triangle' },
];

const VCOPanel: React.FC<VCOPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={rowStyle}>
        <Knob label="Pitch" value={params.frequency} min={-2} max={2} step={0.01} onChange={set('frequency')} />
        <Knob label="FM Depth" value={params.fmDepth} min={0} max={1} step={0.01} onChange={set('fmDepth')} />
      </div>
      <Select
        label="Waveform"
        value={params.waveform}
        options={waveformOptions}
        onChange={set('waveform')}
      />
      <div style={rowStyle}>
        <Knob label="PW" value={params.pulseWidth} min={0} max={1} step={0.01} onChange={set('pulseWidth')} />
        <Knob label="PWM Depth" value={params.pwmDepth} min={0} max={1} step={0.01} onChange={set('pwmDepth')} />
      </div>
    </ModulePanel>
  );
};

export default VCOPanel;
