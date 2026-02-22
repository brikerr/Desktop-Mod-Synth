import { createWorkletNode } from './base-node.ts';

export function createVCANode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'vca',
    processorName: 'vca-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      gain: params.gain ?? 0.8,
    },
  });
}
