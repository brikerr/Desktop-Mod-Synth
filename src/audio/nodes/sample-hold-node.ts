import { createWorkletNode } from './base-node.ts';

export function createSampleHoldNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'sampleHold',
    processorName: 'sample-hold-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      threshold: params.threshold ?? 0.5,
    },
  });
}
