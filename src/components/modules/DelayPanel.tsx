import React, { useCallback } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import ModulePanel from '../ModulePanel.tsx';
import Knob from '../controls/Knob.tsx';

interface DelayPanelProps {
  moduleId: string;
}

const DelayPanel: React.FC<DelayPanelProps> = ({ moduleId }) => {
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
        <Knob label="Time" value={params.time} min={0.01} max={2.0} step={0.01} onChange={set('time')} />
        <Knob label="Feedback" value={params.feedback} min={0} max={0.95} step={0.01} onChange={set('feedback')} />
      </div>
      <div style={rowStyle}>
        <Knob label="Mix" value={params.mix} min={0} max={1} step={0.01} onChange={set('mix')} />
        <Knob label="Mod Depth" value={params.timeModDepth} min={0} max={1} step={0.01} onChange={set('timeModDepth')} />
      </div>
    </ModulePanel>
  );
};

export default DelayPanel;
