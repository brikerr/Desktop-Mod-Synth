import type { ModuleType } from '../types/index.ts';

export type PresetCategory =
  | 'keys'
  | 'bass'
  | 'lead'
  | 'pad'
  | 'percussion'
  | 'fx'
  | 'sequencer'
  | 'utility';

export interface PresetModule {
  id: string; // symbolic ID ("m1") for internal reference
  type: ModuleType;
  x: number;
  y: number;
  params: Record<string, number>; // sparse — missing keys use module defaults
}

export interface PresetConnection {
  sourceModuleId: string; // symbolic module ID
  sourcePortId: string;
  destModuleId: string;
  destPortId: string;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  isFactory: boolean;
  version: 1;
  modules: PresetModule[];
  connections: PresetConnection[];
}
