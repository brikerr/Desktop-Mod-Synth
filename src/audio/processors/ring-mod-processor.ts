// Ring Modulator AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class RingModProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'mix', defaultValue: 1.0, minValue: 0, maxValue: 1, automationRate: 'a-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const carrierIn = inputs[0]?.[0];
    const modulatorIn = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const mixParam = parameters.mix;
    const mixIsConstant = mixParam.length === 1;

    for (let i = 0; i < output.length; i++) {
      const carrier = carrierIn ? carrierIn[i] : 0;
      const modulator = modulatorIn ? modulatorIn[i] : 0;
      const mix = mixIsConstant ? mixParam[0] : mixParam[i];

      output[i] = carrier * (1 - mix) + (carrier * modulator) * mix;
    }

    return true;
  }
}

registerProcessor('ring-mod-processor', RingModProcessor);
