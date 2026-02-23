import type { Preset } from './types.ts';

const USER_PRESETS_KEY = 'mod-synth-user-presets';
const ACTIVE_PRESET_KEY = 'mod-synth-active-preset';

export function loadUserPresets(): Preset[] {
  try {
    const raw = localStorage.getItem(USER_PRESETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Preset[];
  } catch {
    return [];
  }
}

export function saveUserPresets(presets: Preset[]): void {
  localStorage.setItem(USER_PRESETS_KEY, JSON.stringify(presets));
}

export function addUserPreset(preset: Preset): void {
  const presets = loadUserPresets();
  presets.push(preset);
  saveUserPresets(presets);
}

export function removeUserPreset(id: string): void {
  const presets = loadUserPresets().filter((p) => p.id !== id);
  saveUserPresets(presets);
}

export function getActivePresetId(): string | null {
  return localStorage.getItem(ACTIVE_PRESET_KEY);
}

export function setActivePresetId(id: string | null): void {
  if (id) {
    localStorage.setItem(ACTIVE_PRESET_KEY, id);
  } else {
    localStorage.removeItem(ACTIVE_PRESET_KEY);
  }
}
