import type { SignalType } from '../types/index.ts';

export interface ThemeTokens {
  // Surfaces
  bgApp: string;
  bgToolbar: string;
  bgPanel: string;
  bgPanelHeader: string;
  bgControl: string;
  bgKeyboard: string;
  gridBg: string;
  gridLine: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Borders
  borderSubtle: string;
  borderControl: string;

  // Accent
  accent: string;
  accentHover: string;

  // Signal colors (audio=yellow Max MSP, cv=cyan, gate=green)
  signalAudio: string;
  signalCv: string;
  signalGate: string;
  signalAudioBg: string;
  signalCvBg: string;
  signalGateBg: string;

  // Controls
  knobTrack: string;
  knobRing: string;
  knobTick: string;
  sliderTrack: string;
  sliderThumb: string;

  // Keyboard
  whiteKey: string;
  whiteKeyActive: string;
  blackKey: string;
  blackKeyActive: string;
  keyBorder: string;

  // Oscilloscope
  scopeBg: string;
  scopeGrid: string;
  scopeCenter: string;
  scopeWaveform: string;
  scopeTrigger: string;

  // Tooltip / toast
  tooltipBg: string;
  tooltipBorder: string;

  // Cable
  cableOpacity: number;
  cableWidth: number;

  // Glass / panel
  panelRadius: number;
  glassBg: string;
  glassBorder: string;
  glassShadow: string;
  glassHeaderBg: string;
  glassHighlight: string;

  // Sizing
  borderRadius: number;
  fontBase: string;
  fontMono: string;
  fontSize: number;
  fontSizeLabel: number;
  portSize: number;
  knobSize: number;

  // Audio ready indicator
  audioReady: string;

  // Delete button
  deleteButton: string;
  deleteButtonHover: string;
}

export const darkTheme: ThemeTokens = {
  bgApp: '#191919',
  bgToolbar: '#222222',
  bgPanel: '#282828',
  bgPanelHeader: '#333333',
  bgControl: '#3C3C3C',
  bgKeyboard: '#222222',
  gridBg: '#191919',
  gridLine: '#2A2A2A',

  textPrimary: '#CCCCCC',
  textSecondary: '#999999',
  textMuted: '#666666',

  borderSubtle: '#3C3C3C',
  borderControl: '#4A4A4A',

  accent: '#FF764D',
  accentHover: '#FF8E6B',

  signalAudio: '#FF44CC',
  signalCv: '#44DDFF',
  signalGate: '#AAFF22',
  signalAudioBg: '#FF44CC30',
  signalCvBg: '#44DDFF30',
  signalGateBg: '#AAFF2230',

  knobTrack: '#222222',
  knobRing: '#4A4A4A',
  knobTick: '#3C3C3C',
  sliderTrack: '#222222',
  sliderThumb: '#CCCCCC',

  whiteKey: '#D8D8D8',
  whiteKeyActive: '#FF764D',
  blackKey: '#282828',
  blackKeyActive: '#FF764D',
  keyBorder: '#191919',

  scopeBg: '#191919',
  scopeGrid: '#2A2A2A',
  scopeCenter: '#3C3C3C',
  scopeWaveform: '#44CC66',
  scopeTrigger: '#FF764D33',

  tooltipBg: '#333333',
  tooltipBorder: '#4A4A4A',

  cableOpacity: 1.0,
  cableWidth: 3,

  panelRadius: 18,
  glassBg: 'rgba(38, 38, 38, 0.65)',
  glassBorder: 'rgba(255, 255, 255, 0.14)',
  glassShadow: '0 6px 32px rgba(0, 0, 0, 0.4)',
  glassHeaderBg: 'rgba(55, 55, 55, 0.6)',
  glassHighlight: 'rgba(255, 255, 255, 0.06)',

  borderRadius: 4,
  fontBase: "'Roboto Mono', 'SF Mono', 'Fira Code', monospace",
  fontMono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: 11,
  fontSizeLabel: 10,
  portSize: 12,
  knobSize: 32,

  audioReady: '#44CC66',

  deleteButton: 'rgba(255,255,255,0.4)',
  deleteButtonHover: 'rgba(255,255,255,0.7)',
};

export const lightTheme: ThemeTokens = {
  bgApp: '#DCDCDC',
  bgToolbar: '#C4C4C4',
  bgPanel: '#C4C4C4',
  bgPanelHeader: '#B8B8B8',
  bgControl: '#AAAAAA',
  bgKeyboard: '#C4C4C4',
  gridBg: '#DCDCDC',
  gridLine: '#CCCCCC',

  textPrimary: '#333333',
  textSecondary: '#666666',
  textMuted: '#999999',

  borderSubtle: '#AAAAAA',
  borderControl: '#999999',

  accent: '#FF764D',
  accentHover: '#FF8E6B',

  signalAudio: '#DD22AA',
  signalCv: '#0099CC',
  signalGate: '#77CC00',
  signalAudioBg: '#DD22AA30',
  signalCvBg: '#0099CC30',
  signalGateBg: '#77CC0030',

  knobTrack: '#B8B8B8',
  knobRing: '#999999',
  knobTick: '#AAAAAA',
  sliderTrack: '#B8B8B8',
  sliderThumb: '#444444',

  whiteKey: '#F0F0F0',
  whiteKeyActive: '#FF764D',
  blackKey: '#444444',
  blackKeyActive: '#FF764D',
  keyBorder: '#999999',

  scopeBg: '#C4C4C4',
  scopeGrid: '#B8B8B8',
  scopeCenter: '#AAAAAA',
  scopeWaveform: '#22AA44',
  scopeTrigger: '#FF764D33',

  tooltipBg: '#C4C4C4',
  tooltipBorder: '#AAAAAA',

  cableOpacity: 1.0,
  cableWidth: 3,

  panelRadius: 18,
  glassBg: 'rgba(230, 230, 230, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.6)',
  glassShadow: '0 6px 32px rgba(0, 0, 0, 0.12)',
  glassHeaderBg: 'rgba(215, 215, 215, 0.55)',
  glassHighlight: 'rgba(255, 255, 255, 0.35)',

  borderRadius: 4,
  fontBase: "'Roboto Mono', 'SF Mono', 'Fira Code', monospace",
  fontMono: "'SF Mono', 'Fira Code', 'Cascadia Code', monospace",
  fontSize: 11,
  fontSizeLabel: 10,
  portSize: 12,
  knobSize: 32,

  audioReady: '#22AA44',

  deleteButton: 'rgba(0,0,0,0.4)',
  deleteButtonHover: 'rgba(0,0,0,0.7)',
};

export function getSignalColor(theme: ThemeTokens, signal: SignalType): string {
  switch (signal) {
    case 'audio': return theme.signalAudio;
    case 'cv': return theme.signalCv;
    case 'gate': return theme.signalGate;
  }
}

export function getSignalBg(theme: ThemeTokens, signal: SignalType): string {
  switch (signal) {
    case 'audio': return theme.signalAudioBg;
    case 'cv': return theme.signalCvBg;
    case 'gate': return theme.signalGateBg;
  }
}
