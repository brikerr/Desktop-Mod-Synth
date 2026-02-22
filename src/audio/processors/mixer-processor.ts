// Mixer (4-channel) AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class MixerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'gain1', defaultValue: 0.8, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'gain2', defaultValue: 0.8, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'gain3', defaultValue: 0.8, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'gain4', defaultValue: 0.8, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'masterGain', defaultValue: 1.0, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const output = outputs[0]?.[0];
    if (!output) return true;

    const gains = [
      parameters.gain1[0],
      parameters.gain2[0],
      parameters.gain3[0],
      parameters.gain4[0],
    ];
    const master = parameters.masterGain[0];

    for (let i = 0; i < output.length; i++) {
      let sum = 0;
      for (let ch = 0; ch < 4; ch++) {
        const inp = inputs[ch]?.[0];
        if (inp) {
          sum += inp[i] * gains[ch];
        }
      }
      // Soft clip with tanh to prevent harsh saturation
      output[i] = Math.tanh(sum * master);
    }

    return true;
  }
}

registerProcessor('mixer-processor', MixerProcessor);
