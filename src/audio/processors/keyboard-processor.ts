// Keyboard AudioWorkletProcessor
// Receives noteOn/noteOff via MessagePort, outputs constant pitch CV and gate
// No imports — runs in AudioWorkletGlobalScope

class KeyboardProcessor extends AudioWorkletProcessor {
  pitchCV = 0;
  gate = 0;

  static get parameterDescriptors() {
    return [
      { name: 'octave', defaultValue: 0, minValue: -3, maxValue: 3, automationRate: 'k-rate' as const },
    ];
  }

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'noteOn') {
        // Convert MIDI note to pitch CV: 0.0 = C4 (MIDI 60), 1.0/octave
        this.pitchCV = (data.note - 60) / 12;
        this.gate = 1.0;
      } else if (data.type === 'noteOff') {
        this.gate = 0.0;
      }
    };
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const pitchOut = outputs[0]?.[0];
    const gateOut = outputs[1]?.[0];

    const octaveOffset = parameters.octave[0];
    const effectivePitchCV = this.pitchCV + octaveOffset;

    if (pitchOut) {
      for (let i = 0; i < pitchOut.length; i++) {
        pitchOut[i] = effectivePitchCV;
      }
    }

    if (gateOut) {
      for (let i = 0; i < gateOut.length; i++) {
        gateOut[i] = this.gate;
      }
    }

    return true;
  }
}

registerProcessor('keyboard-processor', KeyboardProcessor);
