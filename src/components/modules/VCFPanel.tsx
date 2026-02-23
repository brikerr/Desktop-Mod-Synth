import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface VCFPanelProps {
  moduleId: string;
}

const modeOptions = [
  { value: 0, label: 'LP' },
  { value: 1, label: 'HP' },
  { value: 2, label: 'BP' },
];

const VCFPanel: React.FC<VCFPanelProps> = ({ moduleId }) => {
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
        <Knob label="Cutoff" value={params.cutoff} min={0} max={1} step={0.01} onChange={set('cutoff')} />
        <Knob label="CV Depth" value={params.cutoffModDepth} min={-1} max={1} step={0.01} onChange={set('cutoffModDepth')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Resonance" value={params.resonance} min={0} max={1} step={0.01} onChange={set('resonance')} />
        <Knob label="Res CV" value={params.resonanceModDepth} min={-1} max={1} step={0.01} onChange={set('resonanceModDepth')} />
      </div>
      <Select
        label="Mode"
        value={params.mode}
        options={modeOptions}
        onChange={set('mode')}
      />
    </ModulePanel>
  );
};

export default VCFPanel;
