// Noise Generator AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class NoiseProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'color', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'level', defaultValue: 0.8, minValue: 0, maxValue: 1, automationRate: 'a-rate' as const },
    ];
  }

  // Pink noise state (Paul Kellet 6-pole approximation)
  private b0 = 0;
  private b1 = 0;
  private b2 = 0;
  private b3 = 0;
  private b4 = 0;
  private b5 = 0;
  private b6 = 0;

  // Brown noise state
  private brownLast = 0;

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const output = outputs[0]?.[0];
    if (!output) return true;

    const color = Math.round(parameters.color[0]); // k-rate: single value
    const levelParam = parameters.level;
    const levelIsConstant = levelParam.length === 1;

    for (let i = 0; i < output.length; i++) {
      const level = levelIsConstant ? levelParam[0] : levelParam[i];
      const white = Math.random() * 2 - 1;
      let sample: number;

      switch (color) {
        case 1: {
          // Pink noise: Paul Kellet 6-pole approximation
          this.b0 = 0.99886 * this.b0 + white * 0.0555179;
          this.b1 = 0.99332 * this.b1 + white * 0.0750759;
          this.b2 = 0.96900 * this.b2 + white * 0.1538520;
          this.b3 = 0.86650 * this.b3 + white * 0.3104856;
          this.b4 = 0.55000 * this.b4 + white * 0.5329522;
          this.b5 = -0.7616 * this.b5 - white * 0.0168980;
          sample = (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + this.b6 + white * 0.5362) * 0.11;
          this.b6 = white * 0.115926;
          break;
        }
        case 2: {
          // Brown noise: leaky integrator
          this.brownLast = (this.brownLast + 0.02 * white) / 1.02;
          sample = this.brownLast * 3.5;
          break;
        }
        default: {
          // White noise
          sample = white;
          break;
        }
      }

      output[i] = sample * level;
    }

    // Denormal flush
    if (Math.abs(this.b0) < 1e-15) this.b0 = 0;
    if (Math.abs(this.b1) < 1e-15) this.b1 = 0;
    if (Math.abs(this.b2) < 1e-15) this.b2 = 0;
    if (Math.abs(this.b3) < 1e-15) this.b3 = 0;
    if (Math.abs(this.b4) < 1e-15) this.b4 = 0;
    if (Math.abs(this.b5) < 1e-15) this.b5 = 0;
    if (Math.abs(this.b6) < 1e-15) this.b6 = 0;
    if (Math.abs(this.brownLast) < 1e-15) this.brownLast = 0;

    return true;
  }
}

registerProcessor('noise-processor', NoiseProcessor);
