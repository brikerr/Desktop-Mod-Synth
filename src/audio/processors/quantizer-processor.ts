// Quantizer AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class QuantizerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'scale', defaultValue: 0, minValue: 0, maxValue: 4, automationRate: 'k-rate' as const },
      { name: 'rootNote', defaultValue: 0, minValue: 0, maxValue: 11, automationRate: 'k-rate' as const },
    ];
  }

  private scales: number[][] = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // Chromatic
    [0, 2, 4, 5, 7, 9, 11],                   // Major
    [0, 2, 3, 5, 7, 8, 10],                   // Minor
    [0, 2, 4, 7, 9],                           // Pentatonic
    [0, 3, 5, 6, 7, 10],                       // Blues
  ];

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const cvIn = inputs[0]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const scaleIdx = Math.round(parameters.scale[0]);
    const rootNote = Math.round(parameters.rootNote[0]);
    const scale = this.scales[scaleIdx] || this.scales[0];

    for (let i = 0; i < output.length; i++) {
      const cv = cvIn ? cvIn[i] : 0;

      // Convert CV to semitones from C4 (CV 0 = C4)
      const semis = cv * 12;

      // Offset by root note so quantization is relative to root
      const adjusted = semis - rootNote;

      // Find octave and position within octave
      const octave = Math.floor(adjusted / 12);
      let position = adjusted - octave * 12;
      if (position < 0) position += 12;

      // Find nearest scale degree
      let bestNote = scale[0];
      let bestDist = 999;
      for (let s = 0; s < scale.length; s++) {
        const dist = Math.abs(position - scale[s]);
        // Also check wrapping around the octave
        const distWrap = Math.abs(position - (scale[s] + 12));
        const minDist = Math.min(dist, distWrap);
        if (minDist < bestDist) {
          bestDist = minDist;
          bestNote = scale[s];
        }
      }

      // Also check if wrapping to next octave's first note is closer
      const wrapDist = Math.abs(position - 12);
      if (wrapDist < bestDist) {
        bestNote = 0;
      }

      // Convert back to CV
      const quantizedSemis = octave * 12 + bestNote + rootNote;
      output[i] = quantizedSemis / 12;
    }

    return true;
  }
}

registerProcessor('quantizer-processor', QuantizerProcessor);
