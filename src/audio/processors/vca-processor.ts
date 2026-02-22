// VCA (Voltage Controlled Amplifier) AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class VCAProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'gain', defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: 'a-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const cvIn = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const gainParam = parameters.gain;
    const gainIsConstant = gainParam.length === 1;

    for (let i = 0; i < output.length; i++) {
      const audio = audioIn ? audioIn[i] : 0;
      const cv = cvIn ? cvIn[i] : 1;
      const g = gainIsConstant ? gainParam[0] : gainParam[i];

      // When CV is connected, gain attenuates the CV signal
      // When no CV (defaults to 1), gain acts as manual volume
      const effectiveGain = Math.max(0, cv * g);
      output[i] = audio * effectiveGain;
    }

    return true;
  }
}

registerProcessor('vca-processor', VCAProcessor);
