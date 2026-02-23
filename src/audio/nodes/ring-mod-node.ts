import { createWorkletNode } from './base-node.ts';

export function createRingModNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'ringMod',
    processorName: 'ring-mod-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      mix: params.mix ?? 1.0,
    },
  });
}
