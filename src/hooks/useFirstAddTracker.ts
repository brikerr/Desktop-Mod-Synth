const STORAGE_KEY = 'mod-synth-shown-module-tips';

function getShownSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore corrupt data */ }
  return new Set();
}

function persist(shown: Set<string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...shown]));
}

export function hasShownTip(type: string): boolean {
  return getShownSet().has(type);
}

export function markTipShown(type: string): void {
  const shown = getShownSet();
  shown.add(type);
  persist(shown);
}
