// Step Sequencer AudioWorkletProcessor
// No imports — runs in AudioWorkletGlobalScope

class StepSequencerProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      { name: 'step0', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step1', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step2', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step3', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step4', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step5', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step6', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'step7', defaultValue: 0, minValue: -2, maxValue: 2, automationRate: 'k-rate' as const },
      { name: 'gateLength', defaultValue: 0.5, minValue: 0.1, maxValue: 0.9, automationRate: 'k-rate' as const },
      { name: 'steps', defaultValue: 8, minValue: 1, maxValue: 8, automationRate: 'k-rate' as const },
    ];
  }

  private prevClock = 0;
  private prevReset = 0;
  private currentStep = 0;
  private gateSamplesRemaining = 0;
  private lastClockTime = 0;
  private clockInterval = 0.25 * sampleRate; // default 0.25s in samples

  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>,
  ): boolean {
    const clockIn = inputs[0]?.[0];
    const resetIn = inputs[1]?.[0];
    const cvOut = outputs[0]?.[0];
    const gateOut = outputs[1]?.[0];

    const gateLength = parameters.gateLength[0];
    const stepCount = Math.round(parameters.steps[0]);

    const stepValues: number[] = [
      parameters.step0[0],
      parameters.step1[0],
      parameters.step2[0],
      parameters.step3[0],
      parameters.step4[0],
      parameters.step5[0],
      parameters.step6[0],
      parameters.step7[0],
    ];

    for (let i = 0; i < (cvOut?.length ?? 128); i++) {
      const clock = clockIn ? clockIn[i] : 0;
      const reset = resetIn ? resetIn[i] : 0;

      // Reset rising edge
      if (this.prevReset < 0.5 && reset >= 0.5) {
        this.currentStep = 0;
        this.port.postMessage({ type: 'stepChange', step: this.currentStep });
      }

      // Clock rising edge
      if (this.prevClock < 0.5 && clock >= 0.5) {
        // Track clock interval
        const now = this.lastClockTime + i;
        if (this.lastClockTime > 0) {
          this.clockInterval = now - this.lastClockTime;
        }
        this.lastClockTime = now;

        this.currentStep = (this.currentStep + 1) % stepCount;
        this.gateSamplesRemaining = Math.floor(this.clockInterval * gateLength);
        this.port.postMessage({ type: 'stepChange', step: this.currentStep });
      }

      this.prevClock = clock;
      this.prevReset = reset;

      // Output CV for current step
      if (cvOut) {
        cvOut[i] = stepValues[this.currentStep] ?? 0;
      }

      // Gate output
      if (gateOut) {
        gateOut[i] = this.gateSamplesRemaining > 0 ? 1.0 : 0.0;
      }

      if (this.gateSamplesRemaining > 0) {
        this.gateSamplesRemaining--;
      }
    }

    // Advance lastClockTime by block size for interval tracking
    this.lastClockTime += (cvOut?.length ?? 128);

    return true;
  }
}

registerProcessor('step-sequencer-processor', StepSequencerProcessor);
