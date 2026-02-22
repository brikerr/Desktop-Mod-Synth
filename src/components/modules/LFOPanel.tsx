import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface LFOPanelProps {
  moduleId: string;
}

const waveformOptions = [
  { value: 0, label: 'Sine' },
  { value: 1, label: 'Tri' },
  { value: 2, label: 'Saw' },
  { value: 3, label: 'Square' },
  { value: 4, label: 'S&H' },
];

const LFOPanel: React.FC<LFOPanelProps> = ({ moduleId }) => {
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
    gap: 10,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={rowStyle}>
        <Knob label="Rate" value={params.rate} min={0.01} max={50} step={0.01} onChange={set('rate')} />
        <Knob label="Depth" value={params.depth} min={0} max={1} step={0.01} onChange={set('depth')} />
      </div>
      <Select
        label="Waveform"
        value={params.waveform}
        options={waveformOptions}
        onChange={set('waveform')}
      />
      <Knob label="Mod" value={params.rateModDepth} min={-1} max={1} step={0.01} onChange={set('rateModDepth')} />
    </ModulePanel>
  );
};

export default LFOPanel;
