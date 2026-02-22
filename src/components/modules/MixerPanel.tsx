import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Slider from '../controls/Slider.tsx';
import Knob from '../controls/Knob.tsx';

interface MixerPanelProps {
  moduleId: string;
}

const MixerPanel: React.FC<MixerPanelProps> = ({ moduleId }) => {
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
        <Slider label="1" value={params.gain1} min={0} max={2} step={0.01} onChange={set('gain1')} />
        <Slider label="2" value={params.gain2} min={0} max={2} step={0.01} onChange={set('gain2')} />
        <Slider label="3" value={params.gain3} min={0} max={2} step={0.01} onChange={set('gain3')} />
        <Slider label="4" value={params.gain4} min={0} max={2} step={0.01} onChange={set('gain4')} />
      </div>
      <Knob label="Master" value={params.masterGain} min={0} max={2} step={0.01} onChange={set('masterGain')} />
    </ModulePanel>
  );
};

export default MixerPanel;
