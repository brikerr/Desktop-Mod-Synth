// Oscilloscope AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class OscilloscopeProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'timeDiv', defaultValue: 5, minValue: 1, maxValue: 50, automationRate: 'k-rate' as const },
      { name: 'triggerLevel', defaultValue: 0, minValue: -1, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'freeze', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  private ringBuffer = new Float32Array(2048);
  private writePos = 0;
  private samplesSinceSend = 0;
  private frozen = false;

  constructor() {
    super();
    this.port.onmessage = (e: MessageEvent) => {
      if (e.data?.type === 'freeze') {
        this.frozen = !!e.data.value;
      }
    };
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    const freeze = parameters.freeze[0] > 0.5 || this.frozen;

    // Passthrough: copy input to output
    if (output) {
      if (input) {
        for (let i = 0; i < output.length; i++) {
          output[i] = input[i];
        }
      } else {
        output.fill(0);
      }
    }

    // Fill ring buffer (unless frozen)
    if (!freeze && input) {
      for (let i = 0; i < input.length; i++) {
        this.ringBuffer[this.writePos] = input[i];
        this.writePos = (this.writePos + 1) % 2048;
      }
    }

    this.samplesSinceSend += (input?.length ?? 128);

    // Send snapshot every ~1024 samples (~43fps at 44.1kHz)
    if (this.samplesSinceSend >= 1024) {
      this.samplesSinceSend = 0;

      // Create a transferable copy ordered from oldest to newest
      const snapshot = new Float32Array(2048);
      for (let i = 0; i < 2048; i++) {
        snapshot[i] = this.ringBuffer[(this.writePos + i) % 2048];
      }

      this.port.postMessage({ type: 'waveform', buffer: snapshot.buffer }, [snapshot.buffer]);
    }

    return true;
  }
}

registerProcessor('oscilloscope-processor', OscilloscopeProcessor);
