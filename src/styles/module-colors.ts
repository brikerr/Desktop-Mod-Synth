import type { ModuleType } from '../types/index.ts';

export interface ModuleColor {
  primary: string;
  secondary: string;
}

export const moduleColors: Record<ModuleType, ModuleColor> = {
  vco:          { primary: '#e94560', secondary: '#ff6b81' },
  vcf:          { primary: '#4ecdc4', secondary: '#7eddd6' },
  vca:          { primary: '#45b7d1', secondary: '#6dc8e0' },
  envelope:     { primary: '#f9ca24', secondary: '#fbd75b' },
  lfo:          { primary: '#a29bfe', secondary: '#b8b3fe' },
  mixer:        { primary: '#fd79a8', secondary: '#fda3c0' },
  keyboard:     { primary: '#00b894', secondary: '#55dbb8' },
  output:       { primary: '#636e72', secondary: '#838e92' },
  noise:        { primary: '#d63031', secondary: '#e05555' },
  delay:        { primary: '#6c5ce7', secondary: '#8d80ed' },
  reverb:       { primary: '#0984e3', secondary: '#3fa0ea' },
  oscilloscope: { primary: '#00cec9', secondary: '#33e0dc' },
};

export function getModuleColor(type: ModuleType): ModuleColor {
  return moduleColors[type];
}
