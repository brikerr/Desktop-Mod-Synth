// Sample & Hold AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class SampleHoldProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'threshold', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private heldValue = 0;
  private prevTrigger = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const signalIn = inputs[0]?.[0];
    const triggerIn = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const threshold = parameters.threshold[0];

    for (let i = 0; i < output.length; i++) {
      const trigVal = triggerIn ? triggerIn[i] : 0;

      // Rising edge detection
      if (this.prevTrigger < threshold && trigVal >= threshold) {
        this.heldValue = signalIn ? signalIn[i] : 0;
      }

      this.prevTrigger = trigVal;
      output[i] = this.heldValue;
    }

    return true;
  }
}

registerProcessor('sample-hold-processor', SampleHoldProcessor);
