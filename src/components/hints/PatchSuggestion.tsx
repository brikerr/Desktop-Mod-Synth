import React, { useMemo } from 'react';
import { useSynthStore } from '../../store/synth-store.ts';
import { useTheme } from '../../store/theme-store.ts';
import { getPatchSuggestion } from '../../hints/patching-suggestions.ts';

interface PatchSuggestionProps {
  moduleId: string;
  portId: string;
  direction: 'input' | 'output';
}

const PatchSuggestion: React.FC<PatchSuggestionProps> = ({ moduleId, portId, direction }) => {
  const modules = useSynthStore((s) => s.modules);
  const connections = useSynthStore((s) => s.connections);
  const theme = useTheme();

  const suggestion = useMemo(
    () => getPatchSuggestion(moduleId, portId, modules, connections),
    [moduleId, portId, modules, connections],
  );

  if (!suggestion) return null;

  const arrow = direction === 'output' ? '\u2192' : '\u2190';

  return (
    <span
      style={{
        fontSize: 8,
        color: theme.textMuted,
        opacity: 0.5,
        fontFamily: theme.fontBase,
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
