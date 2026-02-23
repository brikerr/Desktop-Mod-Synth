import { createWorkletNode } from './base-node.ts';

export function createQuantizerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'quantizer',
    processorName: 'quantizer-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      scale: params.scale ?? 0,
      rootNote: params.rootNote ?? 0,
    },
  });
}
