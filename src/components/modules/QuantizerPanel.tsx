import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Select from '../controls/Select.tsx';

interface QuantizerPanelProps {
  moduleId: string;
}

const scaleOptions = [
  { value: 0, label: 'Chromatic' },
  { value: 1, label: 'Major' },
  { value: 2, label: 'Minor' },
  { value: 3, label: 'Pentatonic' },
  { value: 4, label: 'Blues' },
];

const rootNoteOptions = [
  { value: 0, label: 'C' },
  { value: 1, label: 'C#' },
  { value: 2, label: 'D' },
  { value: 3, label: 'D#' },
  { value: 4, label: 'E' },
  { value: 5, label: 'F' },
  { value: 6, label: 'F#' },
  { value: 7, label: 'G' },
  { value: 8, label: 'G#' },
  { value: 9, label: 'A' },
  { value: 10, label: 'A#' },
  { value: 11, label: 'B' },
];

const QuantizerPanel: React.FC<QuantizerPanelProps> = ({ moduleId }) => {
  const params = useSynthStore((s) => s.modules[moduleId]?.params);
  const updateParam = useSynthStore((s) => s.updateParam);

  const set = useCallback(
    (name: string) => (value: number) => updateParam(moduleId, name, value),
    [moduleId, updateParam],
  );

  if (!params) return null;

  return (
    <ModulePanel moduleId={moduleId}>
      <Select label="Scale" value={params.scale} options={scaleOptions} onChange={set('scale')} />
      <Select label="Root" value={params.rootNote} options={rootNoteOptions} onChange={set('rootNote')} />
    </ModulePanel>
  );
};

export default QuantizerPanel;
