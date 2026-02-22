import { createWorkletNode } from './base-node.ts';

export function createNoiseNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'noise',
    processorName: 'noise-processor',
    numberOfInputs: 0,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      color: params.color ?? 0,
      level: params.level ?? 0.8,
    },
  });
}
