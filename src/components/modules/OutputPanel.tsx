import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface OutputPanelProps {
  moduleId: string;
}

const OutputPanel: React.FC<OutputPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  return (
    <ModulePanel moduleId={moduleId}>
      <Knob label="Volume" value={params.masterVolume} min={0} max={1} step={0.01} onChange={set('masterVolume')} />
    </ModulePanel>
  );
};

export default OutputPanel;
