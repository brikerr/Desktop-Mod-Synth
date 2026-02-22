// Reverb AudioWorkletProcessor (Freeverb algorithm)
// No imports — runs in AudioWorkletGlobalScope

class CombFilter {
  private buffer: Float32Array;
  private bufferSize: number;
  private index = 0;
  private filterStore = 0;

  constructor(size: number) {
    this.bufferSize = size;
    this.buffer = new Float32Array(size);
  }

  process(input: number, feedback: number, damp: number): number {
    const output = this.buffer[this.index];
    // One-pole lowpass in feedback path for damping
    this.filterStore = output * (1 - damp) + this.filterStore * damp;
    if (Math.abs(this.filterStore) < 1e-15) this.filterStore = 0; // denormal flush

    this.buffer[this.index] = input + this.filterStore * feedback;
    this.index = (this.index + 1) % this.bufferSize;
    return output;
  }
}

class AllpassFilter {
  private buffer: Float32Array;
  private bufferSize: number;
  private index = 0;

  constructor(size: number) {
    this.bufferSize = size;
    this.buffer = new Float32Array(size);
  }

  process(input: number): number {
    const buffered = this.buffer[this.index];
    const output = -input + buffered;
    this.buffer[this.index] = input + buffered * 0.5;
    this.index = (this.index + 1) % this.bufferSize;
    return output;
  }
}

class ReverbProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'decay', defaultValue: 2.0, minValue: 0.1, maxValue: 10.0, automationRate: 'k-rate' as const },
      { name: 'damping', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'mix', defaultValue: 0.3, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private combs: CombFilter[];
  private allpasses: AllpassFilter[];

  constructor() {
    super();

    const scale = sampleRate / 44100;

    // Freeverb comb filter lengths
    const combLengths = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
    this.combs = combLengths.map((len) => new CombFilter(Math.round(len * scale)));

    // Freeverb allpass filter lengths
    const allpassLengths = [556, 441, 341, 225];
    this.allpasses = allpassLengths.map((len) => new AllpassFilter(Math.round(len * scale)));
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const decay = parameters.decay[0]; // k-rate
    const damping = parameters.damping[0]; // k-rate
    const mix = parameters.mix[0]; // k-rate

    // Map decay (0.1-10s) to feedback coefficient (0.28-0.98)
    const decayNorm = (decay - 0.1) / (10.0 - 0.1);
    const feedback = 0.28 + decayNorm * 0.70;

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;

      // Sum 8 parallel comb filters
      let wet = 0;
      for (let c = 0; c < this.combs.length; c++) {
        wet += this.combs[c].process(dry, feedback, damping);
      }
      // Scale by 1/8 (number of combs)
      wet *= 0.125;

      // 4 series allpass filters
      for (let a = 0; a < this.allpasses.length; a++) {
        wet = this.allpasses[a].process(wet);
      }

      // Dry/wet mix
      output[i] = dry * (1 - mix) + wet * mix;
    }

    return true;
  }
}

registerProcessor('reverb-processor', ReverbProcessor);
