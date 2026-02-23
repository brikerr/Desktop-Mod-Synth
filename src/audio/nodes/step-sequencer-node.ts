import { createWorkletNode } from './base-node.ts';

export function createStepSequencerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'stepSequencer',
    processorName: 'step-sequencer-processor',
    numberOfInputs: 2,
    numberOfOutputs: 2,
    outputChannelCount: [1, 1],
    parameterData: {
      step0: params.step0 ?? 0,
      step1: params.step1 ?? 0,
      step2: params.step2 ?? 0,
      step3: params.step3 ?? 0,
      step4: params.step4 ?? 0,
      step5: params.step5 ?? 0,
      step6: params.step6 ?? 0,
      step7: params.step7 ?? 0,
      gateLength: params.gateLength ?? 0.5,
      steps: params.steps ?? 8,
    },
  });
}
