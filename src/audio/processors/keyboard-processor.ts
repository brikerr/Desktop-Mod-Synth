// Keyboard AudioWorkletProcessor
// 4-voice polyphonic: receives noteOn/noteOff via MessagePort,
// outputs 4 pitch CV + 4 gate pairs (8 outputs total)
// No imports — runs in AudioWorkletGlobalScope

interface Voice {
  note: number;
  active: boolean;
  pitchCV: number;
  gate: number;
  age: number; // for voice stealing — higher = older
}

class KeyboardProcessor extends AudioWorkletProcessor {
  voices: Voice[] = [];
  nextVoice = 0;
  ageCounter = 0;

  static get parameterDescriptors() {
    return [
      { name: 'octave', defaultValue: 0, minValue: -3, maxValue: 3, automationRate: 'k-rate' as const },
    ];
  }

  constructor() {
    super();
    for (let i = 0; i < 4; i++) {
      this.voices.push({ note: -1, active: false, pitchCV: 0, gate: 0, age: 0 });
    }

    this.port.onmessage = (event: MessageEvent) => {
      const data = event.data;
      if (data.type === 'noteOn') {
        this.allocateVoice(data.note);
      } else if (data.type === 'noteOff') {
        this.releaseVoice(data.note);
      }
    };
  }

  allocateVoice(midiNote: number): void {
    // Check if this note is already playing — reuse that voice
    for (const voice of this.voices) {
      if (voice.active && voice.note === midiNote) {
        voice.age = this.ageCounter++;
        voice.gate = 1;
        return;
      }
    }

    // Find first free voice using round-robin starting point
    for (let i = 0; i < 4; i++) {
      const idx = (this.nextVoice + i) % 4;
      if (!this.voices[idx].active) {
        this.assignVoice(idx, midiNote);
        this.nextVoice = (idx + 1) % 4;
        return;
      }
    }

    // All voices full — steal the oldest
    let oldestIdx = 0;
    let oldestAge = Infinity;
    for (let i = 0; i < 4; i++) {
      if (this.voices[i].age < oldestAge) {
        oldestAge = this.voices[i].age;
        oldestIdx = i;
      }
    }
    this.assignVoice(oldestIdx, midiNote);
    this.nextVoice = (oldestIdx + 1) % 4;
  }

  assignVoice(idx: number, midiNote: number): void {
    const voice = this.voices[idx];
    voice.note = midiNote;
    voice.active = true;
    voice.pitchCV = (midiNote - 60) / 12;
    voice.gate = 1;
    voice.age = this.ageCounter++;
  }

  releaseVoice(midiNote: number): void {
    for (const voice of this.voices) {
      if (voice.active && voice.note === midiNote) {
        voice.gate = 0;
        voice.active = false;
        return;
      }
    }
  }

  process(
    _inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const octaveOffset = parameters.octave[0];

    for (let v = 0; v < 4; v++) {
      const voice = this.voices[v];
      const pitchOut = outputs[v * 2]?.[0];
      const gateOut = outputs[v * 2 + 1]?.[0];

      const effectivePitchCV = voice.pitchCV + octaveOffset;

      if (pitchOut) {
        for (let i = 0; i < pitchOut.length; i++) {
          pitchOut[i] = effectivePitchCV;
        }
      }

      if (gateOut) {
        for (let i = 0; i < gateOut.length; i++) {
          gateOut[i] = voice.gate;
        }
      }
    }

    return true;
  }
}

registerProcessor('keyboard-processor', KeyboardProcessor);
