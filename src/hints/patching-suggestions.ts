import type { ModuleInstance, CableConnection, PortDefinition } from '../types/index.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';

export interface PatchSuggestionResult {
  targetLabel: string;
  targetModuleId: string;
}

/**
 * Given a port on a module, suggest the best module/port to connect to
 * based on current rack state and static suggestion data.
 */
export function getPatchSuggestion(
  moduleId: string,
  portId: string,
  modules: Record<string, ModuleInstance>,
  connections: Record<string, CableConnection>,
): PatchSuggestionResult | null {
  const module = modules[moduleId];
  if (!module) return null;

  const definition = getModuleDefinition(module.type);
  const port = definition.ports.find((p) => p.id === portId);
  if (!port) return null;

  // Check if this port is already connected
  const isConnected = Object.values(connections).some((c) => {
    if (port.direction === 'output') {
      return c.source.moduleId === moduleId && c.source.portId === portId;
    }
    return c.dest.moduleId === moduleId && c.dest.portId === portId;
  });
  if (isConnected) return null;

  const staticSuggestions = port.direction === 'input'
    ? port.suggestedSources ?? []
    : port.suggestedTargets ?? [];

  // Find candidate modules and score them
  const candidates: { moduleId: string; label: string; score: number }[] = [];

  for (const [candidateId, candidate] of Object.entries(modules)) {
    if (candidateId === moduleId) continue;

    const candidateDef = getModuleDefinition(candidate.type);

    // Find compatible ports on the candidate
    const compatiblePorts = candidateDef.ports.filter((cp) => {
      // Opposite direction
      if (port.direction === 'output' && cp.direction !== 'input') return false;
      if (port.direction === 'input' && cp.direction !== 'output') return false;
      // Compatible signal type
      return cp.signal === port.signal;
    });

    if (compatiblePorts.length === 0) continue;

    // Check if any compatible port is unconnected
    const hasUnconnectedPort = compatiblePorts.some((cp) => {
      return !Object.values(connections).some((c) => {
        if (cp.direction === 'output') {
          return c.source.moduleId === candidateId && c.source.portId === cp.id;
        }
        return c.dest.moduleId === candidateId && c.dest.portId === cp.id;
      });
    });

    let score = 1; // exists
    if (staticSuggestions.includes(candidateDef.label)) score += 2; // mentioned in static suggestions
    if (hasUnconnectedPort) score += 3; // has unconnected compatible port

    candidates.push({ moduleId: candidateId, label: candidateDef.label, score });
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  return { targetLabel: best.label, targetModuleId: best.moduleId };
}
