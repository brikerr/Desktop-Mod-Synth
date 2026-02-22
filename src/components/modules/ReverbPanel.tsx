import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface ReverbPanelProps {
  moduleId: string;
}

const ReverbPanel: React.FC<ReverbPanelProps> = ({ moduleId }) => {
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
        <Knob label="Decay" value={params.decay} min={0.1} max={10} step={0.1} onChange={set('decay')} />
        <Knob label="Damping" value={params.damping} min={0} max={1} step={0.01} onChange={set('damping')} />
        <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
      </div>
    </ModulePanel>
  );
};

export default ReverbPanel;
