import { createWorkletNode } from './base-node.ts';

export function createMixerNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'mixer',
    processorName: 'mixer-processor',
    numberOfInputs: 4,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      gain1: params.gain1 ?? 0.8,
      gain2: params.gain2 ?? 0.8,
      gain3: params.gain3 ?? 0.8,
      gain4: params.gain4 ?? 0.8,
      masterGain: params.masterGain ?? 1.0,
    },
  });
}
