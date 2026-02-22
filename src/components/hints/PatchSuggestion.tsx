import React, { useMemo } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { getPatchSuggestion } from '../../hints/patching-suggestions.ts';

interface PatchSuggestionProps {
  moduleId: string;
  portId: string;
  direction: 'input' | 'output';
}

const PatchSuggestion: React.FC<PatchSuggestionProps> = ({ moduleId, portId, direction }) => {
  const modules = useSynthStore((s) => s.modules);
  const connections = useSynthStore((s) => s.connections);

  const suggestion = useMemo(
    () => getPatchSuggestion(moduleId, portId, modules, connections),
    [moduleId, portId, modules, connections],
  );

  if (!suggestion) return null;

  const arrow = direction === 'output' ? '→' : '←';

  return (
    <span
      style={{
        fontSize: 8,
        color: '#a0a0b0',
        opacity: 0.35,
        fontFamily: 'sans-serif',
        whiteSpace: 'nowrap',
        lineHeight: 1,
        userSelect: 'none',
      }}
    >
      {arrow} {suggestion.targetLabel}
    </span>
  );
};

export default PatchSuggestion;
