import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';
import Select from '../controls/Select.tsx';

interface NoisePanelProps {
  moduleId: string;
}

const colorOptions = [
  { value: 0, label: 'White' },
  { value: 1, label: 'Pink' },
  { value: 2, label: 'Brown' },
];

const NoisePanel: React.FC<NoisePanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  return (
    <ModulePanel moduleId={moduleId}>
      <Select
        label="Color"
        value={params.color}
        options={colorOptions}
        onChange={set('color')}
      />
      <Knob label="Level" value={params.level} min={0} max={1} step={0.01} onChange={set('level')} />
    </ModulePanel>
  );
};

export default NoisePanel;
