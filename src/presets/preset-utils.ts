import type { ModuleInstance, CableConnection } from '../types/index.ts';
import type { Preset, PresetCategory, PresetModule, PresetConnection } from './types.ts';

export function captureCurrentState(
  modules: Record<string, ModuleInstance>,
  connections: Record<string, CableConnection>,
  name: string,
  description: string,
  category: PresetCategory,
): Preset {
  // Build real ID → symbolic ID map
  const realToSymbolic: Record<string, string> = {};
  const moduleList = Object.values(modules);
  moduleList.forEach((mod, i) => {
    realToSymbolic[mod.id] = `m${i + 1}`;
  });

  const presetModules: PresetModule[] = moduleList.map((mod) => ({
    id: realToSymbolic[mod.id],
    type: mod.type,
    x: mod.x,
    y: mod.y,
    params: { ...mod.params },
  }));

  const presetConnections: PresetConnection[] = Object.values(connections).map((conn) => ({
    sourceModuleId: realToSymbolic[conn.source.moduleId],
    sourcePortId: conn.source.portId,
    destModuleId: realToSymbolic[conn.dest.moduleId],
    destPortId: conn.dest.portId,
  }));

  return {
    id: `user_${Date.now()}`,
    name,
    description,
    category,
    isFactory: false,
    version: 1,
    modules: presetModules,
    connections: presetConnections,
  };
}

export function validatePreset(data: unknown): data is Preset {
  if (!data || typeof data !== 'object') return false;
  const p = data as Record<string, unknown>;
  if (typeof p.name !== 'string') return false;
  if (typeof p.version !== 'number') return false;
  if (!Array.isArray(p.modules) || !Array.isArray(p.connections)) return false;

  for (const m of p.modules) {
    if (!m || typeof m !== 'object') return false;
    const mod = m as Record<string, unknown>;
    if (typeof mod.id !== 'string' || typeof mod.type !== 'string') return false;
    if (typeof mod.x !== 'number' || typeof mod.y !== 'number') return false;
  }

  for (const c of p.connections) {
    if (!c || typeof c !== 'object') return false;
    const conn = c as Record<string, unknown>;
    if (
      typeof conn.sourceModuleId !== 'string' ||
      typeof conn.sourcePortId !== 'string' ||
      typeof conn.destModuleId !== 'string' ||
      typeof conn.destPortId !== 'string'
    )
      return false;
  }

  return true;
}
