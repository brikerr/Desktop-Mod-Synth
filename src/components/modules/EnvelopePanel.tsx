import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Slider from '../controls/Slider.tsx';

interface EnvelopePanelProps {
  moduleId: string;
}

const EnvelopePanel: React.FC<EnvelopePanelProps> = ({ moduleId }) => {
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
    alignItems: 'flex-end',
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={rowStyle}>
        <Slider label="A" value={params.attack} min={0.001} max={10} step={0.001} onChange={set('attack')} />
        <Slider label="D" value={params.decay} min={0.001} max={10} step={0.001} onChange={set('decay')} />
        <Slider label="S" value={params.sustain} min={0} max={1} step={0.01} onChange={set('sustain')} />
        <Slider label="R" value={params.release} min={0.001} max={10} step={0.001} onChange={set('release')} />
      </div>
    </ModulePanel>
  );
};

export default EnvelopePanel;
