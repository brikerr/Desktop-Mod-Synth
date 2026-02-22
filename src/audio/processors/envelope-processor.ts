/**
 * envelope-processor.ts
 *
 * AudioWorkletProcessor implementing an ADSR Envelope Generator.
 *
 * Runs in AudioWorkletGlobalScope — no imports from the main bundle.
 *
 * Inputs:
 *   0 = gate_in   (signal; values >= 0.5 are "gate on")
 *
 * Outputs:
 *   0 = envelope_out  (0–1 envelope signal)
 *
 * AudioParams (all k-rate):
 *   attack  — attack time in seconds
 *   decay   — decay time in seconds
 *   sustain — sustain level (0–1)
 *   release — release time in seconds
 */

const IDLE = 0;
const ATTACK = 1;
const DECAY = 2;
const SUSTAIN = 3;
const RELEASE = 4;

const GATE_THRESHOLD = 0.5;

class EnvelopeProcessor extends AudioWorkletProcessor {
  // ---- persistent state across process() calls ----
  private currentState: number = IDLE;
  private envelope: number = 0;
  private prevGate: number = 0;

  static get parameterDescriptors(): AudioParamDescriptor[] {
    return [
      {
        name: 'attack',
        defaultValue: 0.01,
        minValue: 0.001,
        maxValue: 10,
        automationRate: 'k-rate',
      },
      {
        name: 'decay',
        defaultValue: 0.3,
        minValue: 0.001,
        maxValue: 10,
        automationRate: 'k-rate',
      },
      {
        name: 'sustain',
        defaultValue: 0.7,
        minValue: 0,
        maxValue: 1,
        automationRate: 'k-rate',
      },
      {
        name: 'release',
        defaultValue: 0.5,
        minValue: 0.001,
        maxValue: 10,
        automationRate: 'k-rate',
      },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const output = outputs[0];
    const outputChannel = output[0];

    // If there is no output buffer we still keep the processor alive.
    if (!outputChannel) {
      return true;
    }

    const blockSize = outputChannel.length;

    // Gate input — may be unconnected (empty array).
    const gateInput: Float32Array | undefined =
      inputs[0] && inputs[0].length > 0 ? inputs[0][0] : undefined;

    // k-rate params: single value per block (index 0).
    const attackTime = parameters.attack[0];
    const decayTime = parameters.decay[0];
    const sustainLevel = parameters.sustain[0];
    const releaseTime = parameters.release[0];

    // Pre-compute per-block coefficients (k-rate optimisation).
    const sr = sampleRate; // AudioWorkletGlobalScope global
    const attackCoeff = 1 - Math.exp(-1 / (attackTime * sr));
    const decayCoeff = 1 - Math.exp(-1 / (decayTime * sr));
    const releaseCoeff = 1 - Math.exp(-1 / (releaseTime * sr));

    for (let i = 0; i < blockSize; i++) {
      // ---- Gate edge detection ----
      const gateValue = gateInput ? gateInput[i] : 0;
      const gateOn = gateValue >= GATE_THRESHOLD;
      const prevGateOn = this.prevGate >= GATE_THRESHOLD;

      // Rising edge — trigger attack from any state.
      if (gateOn && !prevGateOn) {
        this.currentState = ATTACK;
      }

      // Falling edge — trigger release from any active state.
      if (!gateOn && prevGateOn && this.currentState !== IDLE) {
        this.currentState = RELEASE;
      }

      this.prevGate = gateValue;

      // ---- State machine: exponential approach with overshoot targets ----
      switch (this.currentState) {
        case ATTACK: {
          // Target overshoots 1.0 so the exponential curve actually reaches it.
          const target = 1.1;
          this.envelope += attackCoeff * (target - this.envelope);
          if (this.envelope >= 1.0) {
            this.envelope = 1.0;
            this.currentState = DECAY;
          }
          break;
        }

        case DECAY: {
          // Target undershoots sustain so we converge to it in finite time.
          const target = sustainLevel - 0.1;
          this.envelope += decayCoeff * (target - this.envelope);
          if (this.envelope <= sustainLevel + 0.001) {
            this.envelope = sustainLevel;
            this.currentState = SUSTAIN;
          }
          break;
        }

        case SUSTAIN: {
          // Hold at sustain level.
          this.envelope = sustainLevel;
          break;
        }

        case RELEASE: {
          // Target undershoots 0 so the exponential curve reaches silence.
          const target = -0.1;
          this.envelope += releaseCoeff * (target - this.envelope);
          if (this.envelope <= 0.001) {
            this.envelope = 0;
            this.currentState = IDLE;
          }
          break;
        }

        case IDLE:
        default: {
          this.envelope = 0;
          break;
        }
      }

      // ---- Clamp to valid range and write output ----
      const clamped = this.envelope < 0 ? 0 : this.envelope > 1 ? 1 : this.envelope;
      outputChannel[i] = clamped;

      // Fill all output channels with the same envelope value.
      for (let ch = 1; ch < output.length; ch++) {
        output[ch][i] = clamped;
      }
    }

    // Keep processor alive indefinitely.
    return true;
  }
}

registerProcessor('envelope-processor', EnvelopeProcessor);
