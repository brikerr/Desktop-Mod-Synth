import type { ModuleDefinition, ModuleType } from '../../types/index.ts';

const moduleDefinitions: Record<ModuleType, ModuleDefinition> = {
  vco: {
    type: 'vco',
    label: 'VCO',
    description: 'Voltage-controlled oscillator — generates pitched waveforms',
    detailedDescription:
      'Generates audio waveforms (sine, saw, square, triangle) at a pitch controlled by CV input. The core sound source of most patches. Use FM CV for vibrato or complex timbres, and PWM CV to animate pulse width.',
    firstAddTip: 'VCO generates pitched waveforms. Connect a Keyboard\'s Pitch CV to control its pitch!',
    defaultParams: {
      frequency: 0,
      waveform: 0,
      fmDepth: 0,
      pulseWidth: 0.5,
      pwmDepth: 0,
    },
    ports: [
      { id: 'pitch_cv', name: 'Pitch CV', direction: 'input', signal: 'cv', index: 0, description: 'Control pitch via CV (1V/oct)', suggestedSources: ['Keyboard', 'LFO'] },
      { id: 'fm_cv', name: 'FM CV', direction: 'input', signal: 'cv', index: 1, description: 'Frequency modulation input for vibrato or FM synthesis', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'pwm_cv', name: 'PWM CV', direction: 'input', signal: 'cv', index: 2, description: 'Pulse width modulation — animates square wave timbre', suggestedSources: ['LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Main audio output signal', suggestedTargets: ['VCF', 'VCA', 'Mixer'] },
    ],
  },
  vcf: {
    type: 'vcf',
    label: 'VCF',
    description: 'Voltage-controlled filter — shapes tone by removing frequencies',
    detailedDescription:
      'Removes frequencies above (lowpass), below (highpass), or around (bandpass) a cutoff point. Resonance adds emphasis at the cutoff. Modulate the cutoff with an envelope for classic filter sweeps.',
    firstAddTip: 'VCF shapes tone. Connect a VCO\'s audio out to its input, then modulate cutoff with an Envelope!',
    defaultParams: {
      cutoff: 0.7,
      cutoffModDepth: 0.5,
      resonance: 0.1,
      resonanceModDepth: 0,
      mode: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to be filtered', suggestedSources: ['VCO', 'Noise', 'Mixer'] },
      { id: 'cutoff_cv', name: 'Cutoff CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate filter cutoff frequency', suggestedSources: ['Envelope', 'LFO', 'Keyboard'] },
      { id: 'resonance_cv', name: 'Res CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate filter resonance amount', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Filtered audio output', suggestedTargets: ['VCA', 'Mixer', 'Delay'] },
    ],
  },
  vca: {
    type: 'vca',
    label: 'VCA',
    description: 'Voltage-controlled amplifier — controls signal volume',
    detailedDescription:
      'Controls the amplitude (volume) of an audio signal using CV. Typically driven by an envelope to shape notes — without a VCA+Envelope, sounds play continuously.',
    firstAddTip: 'VCA controls volume. Connect an Envelope to its CV input to shape note dynamics!',
    defaultParams: {
      gain: 0.8,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal whose volume will be controlled', suggestedSources: ['VCO', 'VCF', 'Mixer'] },
      { id: 'cv_in', name: 'CV In', direction: 'input', signal: 'cv', index: 1, description: 'Control voltage for amplitude — typically from an Envelope', suggestedSources: ['Envelope', 'LFO'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Volume-controlled audio output', suggestedTargets: ['Mixer', 'Output', 'Delay'] },
    ],
  },
  envelope: {
    type: 'envelope',
    label: 'Envelope',
    description: 'ADSR envelope generator — shapes notes over time',
    detailedDescription:
      'Generates an Attack-Decay-Sustain-Release contour triggered by a gate signal. Use it to control VCA volume for note shaping, or VCF cutoff for filter sweeps.',
    firstAddTip: 'Envelope shapes notes over time. Connect Keyboard\'s Gate to its input, then send it to a VCA or VCF!',
    defaultParams: {
      attack: 0.01,
      decay: 0.3,
      sustain: 0.7,
      release: 0.5,
    },
    ports: [
      { id: 'gate_in', name: 'Gate In', direction: 'input', signal: 'gate', index: 0, description: 'Trigger signal — starts envelope on high, releases on low', suggestedSources: ['Keyboard'] },
      { id: 'envelope_out', name: 'Env Out', direction: 'output', signal: 'cv', index: 0, description: 'Envelope CV output contour', suggestedTargets: ['VCA', 'VCF'] },
    ],
  },
  lfo: {
    type: 'lfo',
    label: 'LFO',
    description: 'Low-frequency oscillator — adds movement and modulation',
    detailedDescription:
      'Generates slow, repeating waveforms used to modulate other parameters. Use it for vibrato (pitch), tremolo (volume), filter wobble, or any cyclic motion.',
    firstAddTip: 'LFO adds movement. Try connecting it to a VCO\'s FM CV for vibrato, or a VCF\'s cutoff for wobble!',
    defaultParams: {
      rate: 2,
      depth: 0.5,
      waveform: 0,
      rateModDepth: 0,
    },
    ports: [
      { id: 'rate_cv', name: 'Rate CV', direction: 'input', signal: 'cv', index: 0, description: 'Modulate LFO speed from an external source', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'lfo_out', name: 'LFO Out', direction: 'output', signal: 'cv', index: 0, description: 'Low-frequency modulation signal', suggestedTargets: ['VCO', 'VCF', 'VCA'] },
    ],
  },
  mixer: {
    type: 'mixer',
    label: 'Mixer',
    description: 'Combines up to 4 audio signals into one',
    detailedDescription:
      'Sums up to four audio inputs into a single output with individual gain controls. Use it to blend multiple oscillators, or to combine signals before sending to a filter or output.',
    firstAddTip: 'Mixer blends signals together. Connect multiple VCOs or audio sources to its inputs!',
    defaultParams: {
      gain1: 0.8,
      gain2: 0.8,
      gain3: 0.8,
      gain4: 0.8,
      masterGain: 1.0,
    },
    ports: [
      { id: 'input_1', name: 'In 1', direction: 'input', signal: 'audio', index: 0, description: 'Audio input channel 1', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_2', name: 'In 2', direction: 'input', signal: 'audio', index: 1, description: 'Audio input channel 2', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_3', name: 'In 3', direction: 'input', signal: 'audio', index: 2, description: 'Audio input channel 3', suggestedSources: ['VCO', 'Noise'] },
      { id: 'input_4', name: 'In 4', direction: 'input', signal: 'audio', index: 3, description: 'Audio input channel 4', suggestedSources: ['VCO', 'Noise'] },
      { id: 'mix_out', name: 'Mix Out', direction: 'output', signal: 'audio', index: 0, description: 'Combined audio output', suggestedTargets: ['VCF', 'VCA', 'Output'] },
    ],
  },
  keyboard: {
    type: 'keyboard',
    label: 'Keyboard',
    description: 'Pitch CV and gate source — play notes from your keyboard',
    detailedDescription:
      'Converts key presses into pitch CV (1V/oct) and gate signals. The pitch CV controls oscillator frequency, while the gate triggers envelopes for note shaping.',
    firstAddTip: 'Keyboard converts key presses to CV. Connect Pitch CV to a VCO and Gate to an Envelope!',
    defaultParams: {
      octave: 0,
    },
    ports: [
      { id: 'pitch_cv_1', name: 'Pitch 1', direction: 'output', signal: 'cv', index: 0, description: 'Voice 1 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_1', name: 'Gate 1', direction: 'output', signal: 'gate', index: 1, description: 'Voice 1 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_2', name: 'Pitch 2', direction: 'output', signal: 'cv', index: 2, description: 'Voice 2 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_2', name: 'Gate 2', direction: 'output', signal: 'gate', index: 3, description: 'Voice 2 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_3', name: 'Pitch 3', direction: 'output', signal: 'cv', index: 4, description: 'Voice 3 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_3', name: 'Gate 3', direction: 'output', signal: 'gate', index: 5, description: 'Voice 3 gate — high while key held', suggestedTargets: ['Envelope'] },
      { id: 'pitch_cv_4', name: 'Pitch 4', direction: 'output', signal: 'cv', index: 6, description: 'Voice 4 pitch CV (1V/oct)', suggestedTargets: ['VCO'] },
      { id: 'gate_4', name: 'Gate 4', direction: 'output', signal: 'gate', index: 7, description: 'Voice 4 gate — high while key held', suggestedTargets: ['Envelope'] },
    ],
  },
  output: {
    type: 'output',
    label: 'Output',
    description: 'Final audio output to your speakers',
    detailedDescription:
      'Sends audio to your speakers or headphones. Connect the final stage of your signal chain here. Has left and right inputs for stereo.',
    firstAddTip: 'Output sends audio to your speakers. Connect your final audio signal to its inputs!',
    defaultParams: {
      masterVolume: 0.5,
    },
    ports: [
      { id: 'audio_in_left', name: 'Left In', direction: 'input', signal: 'audio', index: 0, description: 'Left channel audio input', suggestedSources: ['VCA', 'Mixer', 'Reverb'] },
      { id: 'audio_in_right', name: 'Right In', direction: 'input', signal: 'audio', index: 1, description: 'Right channel audio input', suggestedSources: ['VCA', 'Mixer', 'Reverb'] },
    ],
  },
  noise: {
    type: 'noise',
    label: 'Noise',
    description: 'Noise generator — white, pink, and other noise colors',
    detailedDescription:
      'Generates random noise signals useful for percussion, wind effects, or adding texture. White noise has equal energy at all frequencies; pink noise rolls off at higher frequencies.',
    firstAddTip: 'Noise generates random signals — great for percussion or texture. Send it through a VCF to shape it!',
    defaultParams: {
      color: 0,
      level: 0.8,
    },
    ports: [
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Noise signal output', suggestedTargets: ['VCF', 'Mixer', 'VCA'] },
    ],
  },
  delay: {
    type: 'delay',
    label: 'Delay',
    description: 'Echo effect — repeats audio with adjustable time and feedback',
    detailedDescription:
      'Creates echoes by repeating the input signal after a delay time. Feedback controls how many repeats occur. Mix blends dry and wet signals. Modulate time with CV for chorus-like effects.',
    firstAddTip: 'Delay creates echoes. Connect audio to its input and adjust time and feedback for rhythmic repeats!',
    defaultParams: {
      time: 0.3,
      feedback: 0.4,
      mix: 0.5,
      timeModDepth: 0,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to be delayed', suggestedSources: ['VCA', 'VCF', 'Mixer'] },
      { id: 'time_cv', name: 'Time CV', direction: 'input', signal: 'cv', index: 1, description: 'Modulate delay time for chorus or warping effects', suggestedSources: ['LFO'] },
      { id: 'feedback_cv', name: 'FB CV', direction: 'input', signal: 'cv', index: 2, description: 'Modulate feedback amount', suggestedSources: ['LFO', 'Envelope'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Delayed audio output (dry + wet mix)', suggestedTargets: ['Reverb', 'Mixer', 'Output'] },
    ],
  },
  reverb: {
    type: 'reverb',
    label: 'Reverb',
    description: 'Reverb effect — adds space and ambience',
    detailedDescription:
      'Simulates the reflections of a room or hall. Decay controls how long the reverb tail lasts. Damping reduces high-frequency content in the tail. Mix blends dry and wet signals.',
    firstAddTip: 'Reverb adds space to your sound. Place it at the end of your chain before the Output!',
    defaultParams: {
      decay: 2.0,
      damping: 0.5,
      mix: 0.3,
    },
    ports: [
      { id: 'audio_in', name: 'Audio In', direction: 'input', signal: 'audio', index: 0, description: 'Audio signal to add reverb to', suggestedSources: ['VCA', 'Delay', 'Mixer'] },
      { id: 'audio_out', name: 'Audio Out', direction: 'output', signal: 'audio', index: 0, description: 'Reverb-processed audio output', suggestedTargets: ['Mixer', 'Output'] },
    ],
  },
  oscilloscope: {
    type: 'oscilloscope',
    label: 'Scope',
    description: 'Visual display — see your waveforms in real time',
    detailedDescription:
      'Displays the waveform of any signal passing through it. Use it to visualize audio or CV signals for debugging or learning. Signal passes through unchanged.',
    firstAddTip: 'Scope visualizes signals. Patch any audio or CV signal through it to see the waveform!',
    defaultParams: {
      timeDiv: 5,
      triggerLevel: 0,
      freeze: 0,
    },
    ports: [
      { id: 'signal_in', name: 'Signal In', direction: 'input', signal: 'audio', index: 0, description: 'Signal to visualize on the display', suggestedSources: ['VCO', 'LFO', 'VCF'] },
      { id: 'signal_out', name: 'Signal Out', direction: 'output', signal: 'audio', index: 0, description: 'Pass-through output — signal is unchanged', suggestedTargets: ['VCF', 'VCA', 'Output'] },
    ],
  },
};

export function getModuleDefinition(type: ModuleType): ModuleDefinition {
  return moduleDefinitions[type];
}

export function getAllModuleDefinitions(): ModuleDefinition[] {
  return Object.values(moduleDefinitions);
}
