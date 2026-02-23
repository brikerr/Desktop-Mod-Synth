import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface WavefolderPanelProps {
  moduleId: string;
}

const WavefolderPanel: React.FC<WavefolderPanelProps> = ({ moduleId }) => {
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
    justifyContent: 'center',
  };

  return (
    <ModulePanel moduleId={moduleId}>
      <div style={rowStyle}>
        <Knob label="Drive" value={params.drive} min={1} max={10} step={0.1} onChange={set('drive')} />
        <Knob label="Folds" value={params.folds} min={1} max={8} step={1} onChange={set('folds')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Symmetry" value={params.symmetry} min={0} max={1} step={0.01} onChange={set('symmetry')} />
        <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
      </div>
    </ModulePanel>
  );
};

export default WavefolderPanel;
