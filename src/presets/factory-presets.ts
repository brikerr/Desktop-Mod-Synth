import type { Preset } from './types.ts';

export const factoryPresets: Preset[] = [
  // ───────────────────────────────────────────────────
  // 1. Classic Poly — clean 4-voice saw polysynth
  // ───────────────────────────────────────────────────
  {
    id: 'factory_classic_poly',
    name: 'Classic Poly',
    description: 'Clean 4-voice saw polysynth',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 320, y: 40, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 320, y: 200, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'vco', x: 320, y: 360, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm5', type: 'vco', x: 320, y: 520, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 560, y: 40, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm7', type: 'envelope', x: 560, y: 200, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm8', type: 'envelope', x: 560, y: 360, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm9', type: 'envelope', x: 560, y: 520, params: { attack: 0.01, decay: 0.3, sustain: 0.7, release: 0.5 } },
      { id: 'm10', type: 'vca', x: 800, y: 40, params: { gain: 0.8 } },
      { id: 'm11', type: 'vca', x: 800, y: 200, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 800, y: 360, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 800, y: 520, params: { gain: 0.8 } },
      { id: 'm14', type: 'mixer', x: 1060, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm15', type: 'output', x: 1300, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm10', destPortId: 'cv_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_4' },
      // Mixer → Output
      { sourceModuleId: 'm14', sourcePortId: 'mix_out', destModuleId: 'm15', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 2. Warm Pad — slow-attack filtered pad with reverb
  // ───────────────────────────────────────────────────
  {
    id: 'factory_warm_pad',
    name: 'Warm Pad',
    description: 'Slow-attack filtered pad with reverb',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 280, y: 40, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 280, y: 200, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'vco', x: 280, y: 360, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm5', type: 'vco', x: 280, y: 520, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 500, y: 40, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm7', type: 'envelope', x: 500, y: 200, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm8', type: 'envelope', x: 500, y: 360, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm9', type: 'envelope', x: 500, y: 520, params: { attack: 0.5, decay: 0.5, sustain: 0.8, release: 1.0 } },
      { id: 'm10', type: 'vca', x: 720, y: 40, params: { gain: 0.8 } },
      { id: 'm11', type: 'vca', x: 720, y: 200, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 720, y: 360, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 720, y: 520, params: { gain: 0.8 } },
      { id: 'm14', type: 'mixer', x: 960, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm15', type: 'vcf', x: 1200, y: 200, params: { cutoff: 0.5, cutoffModDepth: 0.5, resonance: 0.2, resonanceModDepth: 0, mode: 0 } },
      { id: 'm16', type: 'lfo', x: 1200, y: 420, params: { rate: 0.5, depth: 0.3, waveform: 0, rateModDepth: 0 } },
      { id: 'm17', type: 'reverb', x: 1440, y: 200, params: { decay: 3.0, damping: 0.4, mix: 0.4 } },
      { id: 'm18', type: 'output', x: 1680, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm10', destPortId: 'cv_in' },
      { sourceModuleId: 'm10', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'input_4' },
      // Mixer → VCF → Reverb → Output
      { sourceModuleId: 'm14', sourcePortId: 'mix_out', destModuleId: 'm15', destPortId: 'audio_in' },
      { sourceModuleId: 'm16', sourcePortId: 'lfo_out', destModuleId: 'm15', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm15', sourcePortId: 'audio_out', destModuleId: 'm17', destPortId: 'audio_in' },
      { sourceModuleId: 'm17', sourcePortId: 'audio_out', destModuleId: 'm18', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 3. Fat Bass — dual-osc bass with resonant filter
  // ───────────────────────────────────────────────────
  {
    id: 'factory_fat_bass',
    name: 'Fat Bass',
    description: 'Dual-osc bass with resonant filter',
    category: 'bass',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 260, params: { frequency: -1, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'mixer', x: 540, y: 120, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm5', type: 'vcf', x: 780, y: 120, params: { cutoff: 0.4, cutoffModDepth: 0.6, resonance: 0.5, resonanceModDepth: 0, mode: 0 } },
      { id: 'm6', type: 'envelope', x: 540, y: 340, params: { attack: 0.01, decay: 0.2, sustain: 0.6, release: 0.3 } },
      { id: 'm7', type: 'envelope', x: 780, y: 340, params: { attack: 0.005, decay: 0.3, sustain: 0.0, release: 0.2 } },
      { id: 'm8', type: 'vca', x: 1020, y: 120, params: { gain: 0.8 } },
      { id: 'm9', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB pitch → both VCOs
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      // KB gate → both envelopes
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm6', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm7', destPortId: 'gate_in' },
      // VCOs → Mixer
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'input_1' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'input_2' },
      // Mixer → VCF
      { sourceModuleId: 'm4', sourcePortId: 'mix_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // Filter envelope → VCF cutoff
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm5', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // Amp envelope → VCA
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      // VCA → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 4. Acid Lead — squelchy acid line with delay
  // ───────────────────────────────────────────────────
  {
    id: 'factory_acid_lead',
    name: 'Acid Lead',
    description: 'Squelchy acid line with delay',
    category: 'lead',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 120, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vcf', x: 540, y: 120, params: { cutoff: 0.3, cutoffModDepth: 0.8, resonance: 0.7, resonanceModDepth: 0, mode: 0 } },
      { id: 'm4', type: 'envelope', x: 300, y: 340, params: { attack: 0.01, decay: 0.2, sustain: 0.5, release: 0.3 } },
      { id: 'm5', type: 'envelope', x: 540, y: 340, params: { attack: 0.005, decay: 0.15, sustain: 0.0, release: 0.1 } },
      { id: 'm6', type: 'vca', x: 780, y: 120, params: { gain: 0.8 } },
      { id: 'm7', type: 'delay', x: 1020, y: 120, params: { time: 0.3, feedback: 0.4, mix: 0.35, timeModDepth: 0 } },
      { id: 'm8', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB → VCO + Envelopes
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'audio_in' },
      // Filter envelope → VCF cutoff
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm3', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Amp envelope → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 5. Ambient Drone — self-playing evolving texture
  // ───────────────────────────────────────────────────
  {
    id: 'factory_ambient_drone',
    name: 'Ambient Drone',
    description: 'Self-playing evolving texture',
    category: 'pad',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'vco', x: 40, y: 80, params: { frequency: 0, waveform: 0, fmDepth: 0.1, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 320, params: { rate: 0.1, depth: 0.15, waveform: 0, rateModDepth: 0 } },
      { id: 'm3', type: 'lfo', x: 280, y: 320, params: { rate: 0.3, depth: 0.4, waveform: 0, rateModDepth: 0 } },
      { id: 'm4', type: 'wavefolder', x: 280, y: 80, params: { drive: 2, folds: 3, mix: 0.7, symmetry: 0.5, foldModDepth: 0.5 } },
      { id: 'm5', type: 'noise', x: 520, y: 320, params: { color: 0, level: 0.3 } },
      { id: 'm6', type: 'mixer', x: 520, y: 80, params: { gain1: 0.7, gain2: 0.3, gain3: 0.8, gain4: 0.8, masterGain: 0.8 } },
      { id: 'm7', type: 'vcf', x: 760, y: 80, params: { cutoff: 0.4, cutoffModDepth: 0.3, resonance: 0.3, resonanceModDepth: 0, mode: 0 } },
      { id: 'm8', type: 'reverb', x: 1000, y: 80, params: { decay: 6.0, damping: 0.3, mix: 0.6 } },
      { id: 'm9', type: 'output', x: 1240, y: 80, params: { masterVolume: 0.4 } },
    ],
    connections: [
      // LFO1 → VCO FM (slow pitch drift)
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm1', destPortId: 'fm_cv' },
      // VCO → Wavefolder
      { sourceModuleId: 'm1', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'audio_in' },
      // LFO2 → Wavefolder fold CV
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm4', destPortId: 'fold_cv' },
      // Wavefolder → Mixer in1
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_1' },
      // Noise → Mixer in2
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'input_2' },
      // Mixer → VCF → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'mix_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm3', sourcePortId: 'lfo_out', destModuleId: 'm7', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 6. Percussion — snappy noise burst for hats/snares
  // ───────────────────────────────────────────────────
  {
    id: 'factory_percussion',
    name: 'Percussion',
    description: 'Snappy noise burst for hats/snares',
    category: 'percussion',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'noise', x: 300, y: 80, params: { color: 0, level: 0.8 } },
      { id: 'm3', type: 'vcf', x: 540, y: 80, params: { cutoff: 0.6, cutoffModDepth: 0.5, resonance: 0.3, resonanceModDepth: 0, mode: 2 } },
      { id: 'm4', type: 'envelope', x: 300, y: 320, params: { attack: 0.001, decay: 0.1, sustain: 0.0, release: 0.05 } },
      { id: 'm5', type: 'envelope', x: 540, y: 320, params: { attack: 0.001, decay: 0.15, sustain: 0.0, release: 0.08 } },
      { id: 'm6', type: 'vca', x: 780, y: 80, params: { gain: 0.8 } },
      { id: 'm7', type: 'output', x: 1020, y: 80, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB gate → both envelopes
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm4', destPortId: 'gate_in' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // Noise → VCF (bandpass)
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'audio_in' },
      // Filter env → VCF cutoff
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm3', destPortId: 'cutoff_cv' },
      // VCF → VCA
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Amp env → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 7. Step Sequence — 8-step filtered sequence with echo
  // ───────────────────────────────────────────────────
  {
    id: 'factory_step_sequence',
    name: 'Step Sequence',
    description: '8-step filtered sequence with echo',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'lfo', x: 40, y: 120, params: { rate: 4, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      { id: 'm2', type: 'stepSequencer', x: 280, y: 120, params: { step0: 0, step1: 0.2, step2: 0.4, step3: 0.3, step4: 0.5, step5: 0.7, step6: 0.4, step7: 0.6, gateLength: 0.5, steps: 8 } },
      { id: 'm3', type: 'vco', x: 520, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'envelope', x: 520, y: 280, params: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.1 } },
      { id: 'm5', type: 'vcf', x: 760, y: 60, params: { cutoff: 0.5, cutoffModDepth: 0.4, resonance: 0.4, resonanceModDepth: 0, mode: 0 } },
      { id: 'm6', type: 'vca', x: 1000, y: 60, params: { gain: 0.8 } },
      { id: 'm7', type: 'delay', x: 1240, y: 60, params: { time: 0.3, feedback: 0.35, mix: 0.3, timeModDepth: 0 } },
      { id: 'm8', type: 'output', x: 1480, y: 60, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO (square) → Sequencer clock
      { sourceModuleId: 'm1', sourcePortId: 'lfo_out', destModuleId: 'm2', destPortId: 'clock_in' },
      // Sequencer CV → VCO pitch
      { sourceModuleId: 'm2', sourcePortId: 'cv_out', destModuleId: 'm3', destPortId: 'pitch_cv' },
      // Sequencer Gate → Envelope
      { sourceModuleId: 'm2', sourcePortId: 'gate_out', destModuleId: 'm4', destPortId: 'gate_in' },
      // Envelope → VCF cutoff
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm5', destPortId: 'cutoff_cv' },
      // VCO → VCF
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm5', destPortId: 'audio_in' },
      // VCF → VCA
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope → VCA
      { sourceModuleId: 'm4', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 8. Ring Mod Bells — metallic bell tones
  // ───────────────────────────────────────────────────
  {
    id: 'factory_ring_mod_bells',
    name: 'Ring Mod Bells',
    description: 'Metallic bell tones',
    category: 'fx',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 160, params: { octave: 0 } },
      { id: 'm2', type: 'vco', x: 300, y: 60, params: { frequency: 0, waveform: 0, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 280, params: { frequency: 0.6, waveform: 0, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm4', type: 'ringMod', x: 540, y: 120, params: { mix: 1.0 } },
      { id: 'm5', type: 'envelope', x: 540, y: 340, params: { attack: 0.005, decay: 0.8, sustain: 0.0, release: 1.0 } },
      { id: 'm6', type: 'vca', x: 780, y: 120, params: { gain: 0.8 } },
      { id: 'm7', type: 'reverb', x: 1020, y: 120, params: { decay: 4.0, damping: 0.3, mix: 0.5 } },
      { id: 'm8', type: 'output', x: 1260, y: 120, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // KB → VCO1 pitch
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm2', destPortId: 'pitch_cv' },
      // KB gate → Envelope
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm5', destPortId: 'gate_in' },
      // VCO1 → Ring Mod carrier
      { sourceModuleId: 'm2', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'carrier_in' },
      // VCO2 → Ring Mod modulator
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm4', destPortId: 'modulator_in' },
      // Ring Mod → VCA
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm6', destPortId: 'audio_in' },
      // Envelope → VCA
      { sourceModuleId: 'm5', sourcePortId: 'envelope_out', destModuleId: 'm6', destPortId: 'cv_in' },
      // VCA → Reverb → Output
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 9. Random Melody — random quantized notes
  // ───────────────────────────────────────────────────
  {
    id: 'factory_random_melody',
    name: 'Random Melody',
    description: 'Random quantized notes',
    category: 'sequencer',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'noise', x: 40, y: 60, params: { color: 0, level: 0.8 } },
      { id: 'm2', type: 'lfo', x: 40, y: 280, params: { rate: 3, depth: 1.0, waveform: 3, rateModDepth: 0 } },
      { id: 'm3', type: 'sampleHold', x: 280, y: 60, params: { threshold: 0.5 } },
      { id: 'm4', type: 'quantizer', x: 520, y: 60, params: { scale: 4, rootNote: 0 } },
      { id: 'm5', type: 'vco', x: 760, y: 60, params: { frequency: 0, waveform: 1, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0 } },
      { id: 'm6', type: 'envelope', x: 760, y: 280, params: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.15 } },
      { id: 'm7', type: 'vcf', x: 1000, y: 60, params: { cutoff: 0.6, cutoffModDepth: 0.3, resonance: 0.2, resonanceModDepth: 0, mode: 0 } },
      { id: 'm8', type: 'vca', x: 1240, y: 60, params: { gain: 0.8 } },
      { id: 'm9', type: 'delay', x: 1480, y: 60, params: { time: 0.35, feedback: 0.3, mix: 0.3, timeModDepth: 0 } },
      { id: 'm10', type: 'output', x: 1720, y: 60, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // Noise → S&H signal
      { sourceModuleId: 'm1', sourcePortId: 'audio_out', destModuleId: 'm3', destPortId: 'signal_in' },
      // LFO (square) → S&H trigger
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'trigger_in' },
      // S&H → Quantizer
      { sourceModuleId: 'm3', sourcePortId: 'cv_out', destModuleId: 'm4', destPortId: 'cv_in' },
      // Quantizer → VCO pitch
      { sourceModuleId: 'm4', sourcePortId: 'cv_out', destModuleId: 'm5', destPortId: 'pitch_cv' },
      // LFO → Envelope gate (trigger notes)
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm6', destPortId: 'gate_in' },
      // VCO → VCF
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm7', destPortId: 'audio_in' },
      // Envelope → VCF cutoff + VCA
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm7', destPortId: 'cutoff_cv' },
      { sourceModuleId: 'm6', sourcePortId: 'envelope_out', destModuleId: 'm8', destPortId: 'cv_in' },
      // VCF → VCA
      { sourceModuleId: 'm7', sourcePortId: 'audio_out', destModuleId: 'm8', destPortId: 'audio_in' },
      // VCA → Delay → Output
      { sourceModuleId: 'm8', sourcePortId: 'audio_out', destModuleId: 'm9', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'audio_out', destModuleId: 'm10', destPortId: 'audio_in_left' },
    ],
  },

  // ───────────────────────────────────────────────────
  // 10. PWM Strings — ensemble strings with PWM chorus
  // ───────────────────────────────────────────────────
  {
    id: 'factory_pwm_strings',
    name: 'PWM Strings',
    description: 'Ensemble strings with PWM chorus',
    category: 'keys',
    isFactory: true,
    version: 1,
    modules: [
      { id: 'm1', type: 'keyboard', x: 40, y: 200, params: { octave: 0 } },
      { id: 'm2', type: 'lfo', x: 40, y: 440, params: { rate: 0.8, depth: 0.4, waveform: 0, rateModDepth: 0 } },
      { id: 'm3', type: 'vco', x: 300, y: 40, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm4', type: 'vco', x: 300, y: 200, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm5', type: 'vco', x: 300, y: 360, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm6', type: 'vco', x: 300, y: 520, params: { frequency: 0, waveform: 2, fmDepth: 0, pulseWidth: 0.5, pwmDepth: 0.5 } },
      { id: 'm7', type: 'envelope', x: 540, y: 40, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm8', type: 'envelope', x: 540, y: 200, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm9', type: 'envelope', x: 540, y: 360, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm10', type: 'envelope', x: 540, y: 520, params: { attack: 0.3, decay: 0.3, sustain: 0.8, release: 0.6 } },
      { id: 'm11', type: 'vca', x: 780, y: 40, params: { gain: 0.8 } },
      { id: 'm12', type: 'vca', x: 780, y: 200, params: { gain: 0.8 } },
      { id: 'm13', type: 'vca', x: 780, y: 360, params: { gain: 0.8 } },
      { id: 'm14', type: 'vca', x: 780, y: 520, params: { gain: 0.8 } },
      { id: 'm15', type: 'mixer', x: 1020, y: 200, params: { gain1: 0.8, gain2: 0.8, gain3: 0.8, gain4: 0.8, masterGain: 1.0 } },
      { id: 'm16', type: 'output', x: 1260, y: 200, params: { masterVolume: 0.5 } },
    ],
    connections: [
      // LFO → all 4 VCOs PWM CV
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm3', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm4', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm5', destPortId: 'pwm_cv' },
      { sourceModuleId: 'm2', sourcePortId: 'lfo_out', destModuleId: 'm6', destPortId: 'pwm_cv' },
      // Voice 1
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_1', destModuleId: 'm3', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_1', destModuleId: 'm7', destPortId: 'gate_in' },
      { sourceModuleId: 'm3', sourcePortId: 'audio_out', destModuleId: 'm11', destPortId: 'audio_in' },
      { sourceModuleId: 'm7', sourcePortId: 'envelope_out', destModuleId: 'm11', destPortId: 'cv_in' },
      { sourceModuleId: 'm11', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_1' },
      // Voice 2
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_2', destModuleId: 'm4', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_2', destModuleId: 'm8', destPortId: 'gate_in' },
      { sourceModuleId: 'm4', sourcePortId: 'audio_out', destModuleId: 'm12', destPortId: 'audio_in' },
      { sourceModuleId: 'm8', sourcePortId: 'envelope_out', destModuleId: 'm12', destPortId: 'cv_in' },
      { sourceModuleId: 'm12', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_2' },
      // Voice 3
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_3', destModuleId: 'm5', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_3', destModuleId: 'm9', destPortId: 'gate_in' },
      { sourceModuleId: 'm5', sourcePortId: 'audio_out', destModuleId: 'm13', destPortId: 'audio_in' },
      { sourceModuleId: 'm9', sourcePortId: 'envelope_out', destModuleId: 'm13', destPortId: 'cv_in' },
      { sourceModuleId: 'm13', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_3' },
      // Voice 4
      { sourceModuleId: 'm1', sourcePortId: 'pitch_cv_4', destModuleId: 'm6', destPortId: 'pitch_cv' },
      { sourceModuleId: 'm1', sourcePortId: 'gate_4', destModuleId: 'm10', destPortId: 'gate_in' },
      { sourceModuleId: 'm6', sourcePortId: 'audio_out', destModuleId: 'm14', destPortId: 'audio_in' },
      { sourceModuleId: 'm10', sourcePortId: 'envelope_out', destModuleId: 'm14', destPortId: 'cv_in' },
      { sourceModuleId: 'm14', sourcePortId: 'audio_out', destModuleId: 'm15', destPortId: 'input_4' },
      // Mixer → Output
      { sourceModuleId: 'm15', sourcePortId: 'mix_out', destModuleId: 'm16', destPortId: 'audio_in_left' },
    ],
  },
];
