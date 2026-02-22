/**
 * VCF (Voltage Controlled Filter) AudioWorkletProcessor
 *
 * Chamberlin state-variable filter with 2x oversampling.
 * Supports lowpass, highpass, and bandpass modes.
 *
 * Runs in AudioWorkletGlobalScope — no imports from the main bundle.
 */

// ---------------------------------------------------------------------------
// Inline helpers (AudioWorkletGlobalScope has no access to external modules)
// ---------------------------------------------------------------------------

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

class VCFProcessor extends AudioWorkletProcessor {
  // Filter state variables persisted across process() calls
  private low = 0;
  private band = 0;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      { name: 'cutoff', defaultValue: 0.7, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
      { name: 'cutoffModDepth', defaultValue: 0.5, minValue: -1, maxValue: 1, automationRate: 'k-rate' },
      { name: 'resonance', defaultValue: 0.1, minValue: 0, maxValue: 1, automationRate: 'a-rate' },
      { name: 'resonanceModDepth', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' },
      { name: 'mode', defaultValue: 0, minValue: 0, maxValue: 2, automationRate: 'k-rate' },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const output = outputs[0]?.[0];
    if (!output) return true;

    const blockSize = output.length;

    // --- Input channels (may be absent / empty) ---
    const audioIn = inputs[0]?.[0];
    const cutoffCV = inputs[1]?.[0];
    const resonanceCV = inputs[2]?.[0];

    // --- AudioParam arrays ---
    const cutoffParam = parameters.cutoff;
    const cutoffModDepthParam = parameters.cutoffModDepth;
    const resonanceParam = parameters.resonance;
    const resonanceModDepthParam = parameters.resonanceModDepth;
    const modeParam = parameters.mode;

    // k-rate params: use first value for the entire block
    const cutoffModDepth = cutoffModDepthParam[0];
    const resonanceModDepth = resonanceModDepthParam[0];
    const modeRaw = modeParam[0];
    // Snap mode to nearest integer (0, 1, or 2)
    const mode = Math.round(clamp(modeRaw, 0, 2));

    // Effective sample rate for 2x oversampling
    const oversampledRate = sampleRate * 2;

    // Local copies of state for tight inner loop
    let { low, band } = this;

    for (let i = 0; i < blockSize; i++) {
      const input = audioIn ? audioIn[i] : 0;

      // --- Cutoff (a-rate with CV modulation) ---
      const cutoffBase = cutoffParam.length > 1 ? cutoffParam[i] : cutoffParam[0];
      const cvCutoff = cutoffCV ? cutoffCV[i] : 0;
      const effectiveCutoff = clamp(cutoffBase + cvCutoff * cutoffModDepth, 0, 1);

      // Log-mapped frequency: 20 Hz – 20 kHz
      const freq = 20 * Math.pow(1000, effectiveCutoff);

      // Coefficient f for Chamberlin SVF (with 2x oversample factor)
      const f = 2 * Math.sin(Math.PI * freq / oversampledRate);

      // --- Resonance (a-rate with CV modulation) ---
      const resBase = resonanceParam.length > 1 ? resonanceParam[i] : resonanceParam[0];
      const cvRes = resonanceCV ? resonanceCV[i] : 0;
      const effectiveResonance = clamp(resBase + cvRes * resonanceModDepth, 0, 1);

      // q: damping factor — lower q = more resonance. Multiply by 0.99 to prevent blowup.
      const q = 1 - effectiveResonance * 0.99;

      // --- 2x oversampled state-variable filter ---
      let high: number;

      // Pass 1
      high = input - low - q * band;
      band = f * high + band;
      low = f * band + low;

      // Pass 2
      high = input - low - q * band;
      band = f * high + band;
      low = f * band + low;

      // --- Output selection by mode ---
      if (mode === 0) {
        output[i] = low;
      } else if (mode === 1) {
        output[i] = high;
      } else {
        output[i] = band;
      }
    }

    // Flush denormals to zero to prevent CPU spikes
    if (Math.abs(low) < 1e-15) low = 0;
    if (Math.abs(band) < 1e-15) band = 0;

    // Write state back to instance
    this.low = low;
    this.band = band;

    return true;
  }
}

registerProcessor('vcf-processor', VCFProcessor);
