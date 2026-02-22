// LFO (Low Frequency Oscillator) AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class LFOProcessor extends AudioWorkletProcessor {
  phase = 0;
  sampleAndHoldValue = 0;
  prevPhase = 0;

  static get parameterDescriptors() {
    return [
      { name: 'rate', defaultValue: 2, minValue: 0.01, maxValue: 50, automationRate: 'k-rate' as const },
      { name: 'depth', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'waveform', defaultValue: 0, minValue: 0, maxValue: 4, automationRate: 'k-rate' as const },
      { name: 'rateModDepth', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const rateCv = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const baseRate = parameters.rate[0];
    const depth = parameters.depth[0];
    const waveform = Math.round(parameters.waveform[0]);
    const rateModDepth = parameters.rateModDepth[0];

    for (let i = 0; i < output.length; i++) {
      const cv = rateCv ? rateCv[i] : 0;
      const rate = Math.max(0.01, baseRate + cv * rateModDepth * 20);
      const dt = rate / sampleRate;

      this.prevPhase = this.phase;
      this.phase += dt;
      if (this.phase >= 1) this.phase -= 1;

      let sample = 0;
      switch (waveform) {
        case 0: // Sine
          sample = Math.sin(2 * Math.PI * this.phase);
          break;
        case 1: // Triangle
          sample = this.phase < 0.5
            ? 4 * this.phase - 1
            : 3 - 4 * this.phase;
          break;
        case 2: // Saw (ramp down)
          sample = 1 - 2 * this.phase;
          break;
        case 3: // Square
          sample = this.phase < 0.5 ? 1 : -1;
          break;
        case 4: // Sample & Hold
          if (this.phase < this.prevPhase) {
            // Phase wrapped — new random value
            this.sampleAndHoldValue = Math.random() * 2 - 1;
          }
          sample = this.sampleAndHoldValue;
          break;
      }

      output[i] = sample * depth;
    }

    return true;
  }
}

registerProcessor('lfo-processor', LFOProcessor);
