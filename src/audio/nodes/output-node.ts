import { createWorkletNode } from './base-node.ts';

export function createOutputNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  const node = createWorkletNode(ctx, {
    moduleType: 'output',
    processorName: 'output-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [2],
    parameterData: {
      masterVolume: params.masterVolume ?? 0.5,
    },
  });

  // Auto-connect to audio destination
  node.connect(ctx.destination);

  return node;
}
