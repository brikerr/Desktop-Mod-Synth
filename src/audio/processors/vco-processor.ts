/**
 * VCO (Voltage Controlled Oscillator) AudioWorkletProcessor
 *
 * Runs in AudioWorkletGlobalScope — no imports from the main bundle.
 * All helpers are defined inline.
 *
 * Inputs (by index):
 *   0 = pitch_cv   (1V/octave pitch control voltage)
 *   1 = fm_cv      (frequency modulation CV)
 *   2 = pwm_cv     (pulse-width modulation CV)
 *
 * Outputs:
 *   0 = audio_out
 *
 * AudioParams:
 *   frequency  – pitch CV value (1.0/octave, 0.0 = C4 = 261.63 Hz)
 *   waveform   – 0=sine, 1=saw, 2=square, 3=triangle (k-rate)
 *   fmDepth    – FM modulation depth 0–1 (k-rate)
 *   pulseWidth – duty cycle for square wave 0–1 (a-rate)
 *   pwmDepth   – PWM modulation depth 0–1 (k-rate)
 */

// ---------------------------------------------------------------------------
// Inline helpers (AudioWorkletGlobalScope — cannot import)
// ---------------------------------------------------------------------------

/**
 * PolyBLEP anti-aliasing correction term.
 * `t` is the phase [0,1), `dt` is the normalised frequency (freq/sampleRate).
 */
function polyBLEP(t: number, dt: number): number {
  if (t < dt) {
    const t2 = t / dt;
    return t2 + t2 - t2 * t2 - 1.0;
  } else if (t > 1.0 - dt) {
    const t2 = (t - 1.0) / dt;
    return t2 * t2 + t2 + t2 + 1.0;
  }
  return 0.0;
}

// ---------------------------------------------------------------------------
// Waveform constants
// ---------------------------------------------------------------------------
const WAVEFORM_SINE = 0;
const WAVEFORM_SAW = 1;
const WAVEFORM_SQUARE = 2;
const WAVEFORM_TRIANGLE = 3;

const TWO_PI = 2.0 * Math.PI;
const C4_HZ = 261.625565; // Reference pitch: C4

// ---------------------------------------------------------------------------
// Processor
// ---------------------------------------------------------------------------

class VCOProcessor extends AudioWorkletProcessor {
  // Phase accumulator [0, 1)
  private phase: number = 0.0;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: 'frequency',
        defaultValue: 0,
        minValue: -5,
        maxValue: 5,
        automationRate: 'a-rate',
      },
      {
        name: 'waveform',
        defaultValue: 0,
        minValue: 0,
        maxValue: 3,
        automationRate: 'k-rate',
      },
      {
        name: 'fmDepth',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'pulseWidth',
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
        automationRate: 'a-rate',
      },
      {
        name: 'pwmDepth',
        defaultValue: 0,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
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
    const invSampleRate = 1.0 / sampleRate;

    // -----------------------------------------------------------------------
    // Read parameter arrays
    // -----------------------------------------------------------------------
    const frequencyParam = parameters['frequency'];
    const waveformParam = parameters['waveform'];
    const fmDepthParam = parameters['fmDepth'];
    const pulseWidthParam = parameters['pulseWidth'];
    const pwmDepthParam = parameters['pwmDepth'];

    // k-rate values (use first sample)
    const waveform = Math.round(waveformParam[0]);
    const fmDepth = fmDepthParam[0];
    const pwmDepth = pwmDepthParam[0];

    // -----------------------------------------------------------------------
    // Input CV buffers (may be empty if nothing is connected)
    // -----------------------------------------------------------------------
    const pitchCVBuf = inputs[0]?.[0] ?? null;
    const fmCVBuf = inputs[1]?.[0] ?? null;
    const pwmCVBuf = inputs[2]?.[0] ?? null;

    // -----------------------------------------------------------------------
    // Per-sample DSP loop
    // -----------------------------------------------------------------------
    let phase = this.phase;

    for (let i = 0; i < blockSize; i++) {
      // --- Pitch CV ----------------------------------------------------------
      // frequency param is a-rate: may be length 1 (constant) or blockSize
      const freqParamVal =
        frequencyParam.length > 1 ? frequencyParam[i] : frequencyParam[0];

      // Base CV from the frequency parameter + pitch_cv input
      let cv = freqParamVal;
      if (pitchCVBuf !== null) {
        cv += pitchCVBuf[i];
      }

      // --- FM modulation -----------------------------------------------------
      if (fmCVBuf !== null && fmDepth > 0) {
        cv += fmCVBuf[i] * fmDepth;
      }

      // --- Convert CV to frequency (1V/octave, 0 V = C4) --------------------
      const freq = C4_HZ * Math.pow(2.0, cv);

      // Normalised frequency (cycles per sample)
      const dt = Math.abs(freq) * invSampleRate;

      // --- Pulse width (a-rate + PWM CV) -------------------------------------
      let pw =
        pulseWidthParam.length > 1 ? pulseWidthParam[i] : pulseWidthParam[0];
      if (pwmCVBuf !== null && pwmDepth > 0) {
        pw += pwmCVBuf[i] * pwmDepth;
      }
      // Clamp to safe range to avoid silence or full-DC
      pw = pw < 0.01 ? 0.01 : pw > 0.99 ? 0.99 : pw;

      // --- Waveform generation -----------------------------------------------
      let sample = 0.0;

      switch (waveform) {
        // ----- Sine ----------------------------------------------------------
        case WAVEFORM_SINE:
          sample = Math.sin(TWO_PI * phase);
          break;

        // ----- Saw (falling: +1 → −1) ---------------------------------------
        case WAVEFORM_SAW: {
          // Naive saw: linear ramp from −1 to +1
          sample = 2.0 * phase - 1.0;
          // Apply PolyBLEP at the discontinuity
          sample -= polyBLEP(phase, dt);
          break;
        }

        // ----- Square (with PWM) ---------------------------------------------
        case WAVEFORM_SQUARE: {
          // Naive square via threshold comparison
          sample = phase < pw ? 1.0 : -1.0;
          // PolyBLEP correction at rising edge (phase ≈ 0)
          sample += polyBLEP(phase, dt);
          // PolyBLEP correction at falling edge (phase ≈ pw)
          // Shift phase by pw and wrap into [0,1)
          let phaseShifted = phase - pw;
          if (phaseShifted < 0.0) phaseShifted += 1.0;
          sample -= polyBLEP(phaseShifted, dt);
          break;
        }

        // ----- Triangle (integrated square, PolyBLEP-derived) ----------------
        case WAVEFORM_TRIANGLE: {
          // Simple geometric triangle: rises 0→0.5, falls 0.5→1
          if (phase < 0.5) {
            sample = 4.0 * phase - 1.0; // −1 → +1
          } else {
            sample = 3.0 - 4.0 * phase; // +1 → −1
          }
          break;
        }

        default:
          // Fallback to sine for unknown waveform values
          sample = Math.sin(TWO_PI * phase);
          break;
      }

      output[i] = sample;

      // --- Advance & wrap phase accumulator ----------------------------------
      phase += dt;
      if (phase >= 1.0) {
        phase -= 1.0;
      }
    }

    // Store phase for next block
    this.phase = phase;

    return true;
  }
}

registerProcessor('vco-processor', VCOProcessor);
