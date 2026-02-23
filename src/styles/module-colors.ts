import type { ModuleType } from '../types/index.ts';

export interface ModuleColor {
  primary: string;
  secondary: string;
}

export const moduleColors: Record<ModuleType, ModuleColor> = {
  vco:          { primary: '#E87040', secondary: '#F09060' },
  vcf:          { primary: '#40A8A0', secondary: '#60C0B8' },
  vca:          { primary: '#4098C0', secondary: '#60B0D0' },
  envelope:     { primary: '#C8A830', secondary: '#D8C050' },
  lfo:          { primary: '#8878C0', secondary: '#A098D0' },
  mixer:        { primary: '#C06880', secondary: '#D08898' },
  keyboard:     { primary: '#40A870', secondary: '#60C090' },
  output:       { primary: '#808080', secondary: '#989898' },
  noise:        { primary: '#C04848', secondary: '#D06868' },
  delay:        { primary: '#7060C0', secondary: '#9080D0' },
  reverb:       { primary: '#4080C0', secondary: '#6098D0' },
  oscilloscope: { primary: '#40B0A8', secondary: '#60C8C0' },
  sampleHold:   { primary: '#B08040', secondary: '#C8A060' },
  ringMod:      { primary: '#C05888', secondary: '#D878A0' },
  quantizer:    { primary: '#60A040', secondary: '#80B860' },
  wavefolder:   { primary: '#D06030', secondary: '#E08050' },
  spectrum:     { primary: '#4088B0', secondary: '#60A0C8' },
  stepSequencer:{ primary: '#A068C0', secondary: '#B888D0' },
};

export function getModuleColor(type: ModuleType): ModuleColor {
  return moduleColors[type];
}
