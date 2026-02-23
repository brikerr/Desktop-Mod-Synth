// Spectrum Analyzer AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class SpectrumProcessor extends AudioWorkletProcessor {
  private ringBuffer = new Float32Array(2048);
  private writePos = 0;
  private samplesSinceSend = 0;

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    _parameters: Record<string, Float32Array>,
  ): boolean {
    const input = inputs[0]?.[0];
    const output = outputs[0]?.[0];

    // Pass-through
    if (output) {
      if (input) {
        for (let i = 0; i < output.length; i++) {
          output[i] = input[i];
        }
      } else {
        output.fill(0);
      }
    }

    // Collect samples into ring buffer
    if (input) {
      for (let i = 0; i < input.length; i++) {
        this.ringBuffer[this.writePos] = input[i];
        this.writePos = (this.writePos + 1) % 2048;
      }
    }

    this.samplesSinceSend += (input?.length ?? 128);

    // Send FFT data every 2048 samples
    if (this.samplesSinceSend >= 2048) {
      this.samplesSinceSend = 0;

      // Build ordered buffer from ring
      const N = 2048;
      const real = new Float32Array(N);
      const imag = new Float32Array(N);

      for (let i = 0; i < N; i++) {
        // Apply Hann window
        const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
        real[i] = this.ringBuffer[(this.writePos + i) % N] * w;
        imag[i] = 0;
      }

      // In-place radix-2 Cooley-Tukey FFT
      // Bit-reversal permutation
      let j = 0;
      for (let i = 0; i < N; i++) {
        if (i < j) {
          let tmp = real[i]; real[i] = real[j]; real[j] = tmp;
          tmp = imag[i]; imag[i] = imag[j]; imag[j] = tmp;
        }
        let m = N >> 1;
        while (m >= 1 && j >= m) {
          j -= m;
          m >>= 1;
        }
        j += m;
      }

      // FFT butterfly
      for (let size = 2; size <= N; size *= 2) {
        const halfSize = size / 2;
        const angle = -2 * Math.PI / size;
        const wR = Math.cos(angle);
        const wI = Math.sin(angle);

        for (let i = 0; i < N; i += size) {
          let curR = 1, curI = 0;
          for (let k = 0; k < halfSize; k++) {
            const idx1 = i + k;
            const idx2 = i + k + halfSize;
            const tR = curR * real[idx2] - curI * imag[idx2];
            const tI = curR * imag[idx2] + curI * real[idx2];
            real[idx2] = real[idx1] - tR;
            imag[idx2] = imag[idx1] - tI;
            real[idx1] += tR;
            imag[idx1] += tI;
            const newCurR = curR * wR - curI * wI;
            curI = curR * wI + curI * wR;
            curR = newCurR;
          }
        }
      }

      // Compute magnitude (only first half — Nyquist)
      const magnitudes = new Float32Array(N / 2);
      for (let i = 0; i < N / 2; i++) {
        magnitudes[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]) / N;
      }

      this.port.postMessage(
        { type: 'spectrum', buffer: magnitudes.buffer },
        [magnitudes.buffer],
      );
    }

    return true;
  }
}

registerProcessor('spectrum-processor', SpectrumProcessor);
