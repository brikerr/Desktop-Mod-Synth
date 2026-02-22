// Delay AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class DelayProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'time', defaultValue: 0.3, minValue: 0.01, maxValue: 2.0, automationRate: 'a-rate' as const },
      { name: 'feedback', defaultValue: 0.4, minValue: 0, maxValue: 0.95, automationRate: 'a-rate' as const },
      { name: 'mix', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'timeModDepth', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private buffer: Float32Array;
  private writePos = 0;
  private bufferSize: number;

  constructor() {
    super();
    // Max 2 seconds of delay
    this.bufferSize = Math.ceil(2.0 * sampleRate);
    this.buffer = new Float32Array(this.bufferSize);
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const timeCv = inputs[1]?.[0];
    const feedbackCv = inputs[2]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const timeParam = parameters.time;
    const feedbackParam = parameters.feedback;
    const mix = parameters.mix[0]; // k-rate
    const modDepth = parameters.timeModDepth[0]; // k-rate
    const timeIsConstant = timeParam.length === 1;
    const fbIsConstant = feedbackParam.length === 1;

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;
      const tCv = timeCv ? timeCv[i] : 0;
      const fCv = feedbackCv ? feedbackCv[i] : 0;

      const baseTime = timeIsConstant ? timeParam[0] : timeParam[i];
      const baseFb = fbIsConstant ? feedbackParam[0] : feedbackParam[i];

      // CV modulation of time
      const effectiveTime = Math.max(0.001, Math.min(2.0, baseTime + tCv * modDepth));
      // CV modulation of feedback
      const effectiveFb = Math.max(0, Math.min(0.95, baseFb + fCv * 0.5));

      // Delay in samples (fractional)
      const delaySamples = effectiveTime * sampleRate;

      // Read position with linear interpolation
      const readPosFloat = this.writePos - delaySamples;
      const readPosWrapped = ((readPosFloat % this.bufferSize) + this.bufferSize) % this.bufferSize;
      const readIdx = Math.floor(readPosWrapped);
      const frac = readPosWrapped - readIdx;
      const s0 = this.buffer[readIdx];
      const s1 = this.buffer[(readIdx + 1) % this.bufferSize];
      const delayed = s0 + frac * (s1 - s0);

      // Soft-clip feedback to prevent runaway
      const feedbackSample = Math.tanh(delayed * effectiveFb);

      // Write input + feedback into buffer
      this.buffer[this.writePos] = dry + feedbackSample;

      // Advance write position
      this.writePos = (this.writePos + 1) % this.bufferSize;

      // Dry/wet mix
      output[i] = dry * (1 - mix) + delayed * mix;
    }

    return true;
  }
}

registerProcessor('delay-processor', DelayProcessor);
