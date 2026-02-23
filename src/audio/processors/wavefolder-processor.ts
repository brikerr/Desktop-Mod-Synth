// Wavefolder / Distortion AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class WavefolderProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'drive', defaultValue: 1, minValue: 1, maxValue: 10, automationRate: 'a-rate' as const },
      { name: 'folds', defaultValue: 1, minValue: 1, maxValue: 8, automationRate: 'k-rate' as const },
      { name: 'mix', defaultValue: 1.0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'symmetry', defaultValue: 0.5, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
      { name: 'foldModDepth', defaultValue: 0, minValue: 0, maxValue: 1, automationRate: 'k-rate' as const },
    ];
  }

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const audioIn = inputs[0]?.[0];
    const foldCv = inputs[1]?.[0];
    const output = outputs[0]?.[0];
    if (!output) return true;

    const driveParam = parameters.drive;
    const driveIsConstant = driveParam.length === 1;
    const folds = Math.round(parameters.folds[0]);
    const mix = parameters.mix[0];
    const symmetry = parameters.symmetry[0];
    const foldModDepth = parameters.foldModDepth[0];
    const halfPi = Math.PI / 2;

    for (let i = 0; i < output.length; i++) {
      const dry = audioIn ? audioIn[i] : 0;
      const fcv = foldCv ? foldCv[i] : 0;
      const baseDrive = driveIsConstant ? driveParam[0] : driveParam[i];

      const driveAmount = baseDrive + fcv * foldModDepth * 4;
      let x = dry * driveAmount;

      for (let stage = 0; stage < folds; stage++) {
        x += (symmetry - 0.5) * 0.5;
        x = Math.sin(x * halfPi);
      }

      output[i] = dry * (1 - mix) + x * mix;
    }

    return true;
  }
}

registerProcessor('wavefolder-processor', WavefolderProcessor);
