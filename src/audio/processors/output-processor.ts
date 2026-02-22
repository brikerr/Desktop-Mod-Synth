// Output (Master) AudioWorkletProcessor
// Master volume stage — passes audio to destination
// No imports — runs in AudioWorkletGlobalScope

class OutputProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'masterVolume', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'a-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const leftIn = inputs[0]?.[0];
    const rightIn = inputs[1]?.[0];
    const leftOut = outputs[0]?.[0];
    const rightOut = outputs[0]?.[1]; // stereo output on single output bus

    const volumeParam = parameters.masterVolume;
    const volumeIsConstant = volumeParam.length === 1;

    if (leftOut) {
      for (let i = 0; i < leftOut.length; i++) {
        const vol = volumeIsConstant ? volumeParam[0] : volumeParam[i];
        leftOut[i] = (leftIn ? leftIn[i] : 0) * vol;
      }
    }

    if (rightOut) {
      for (let i = 0; i < rightOut.length; i++) {
        const vol = volumeIsConstant ? volumeParam[0] : volumeParam[i];
        // If no right input, mirror left
        const sample = rightIn ? rightIn[i] : (leftIn ? leftIn[i] : 0);
        rightOut[i] = sample * vol;
      }
    }

    return true;
  }
}

registerProcessor('output-processor', OutputProcessor);
