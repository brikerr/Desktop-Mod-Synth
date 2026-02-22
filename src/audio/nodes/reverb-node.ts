import { createWorkletNode } from './base-node.ts';

export function createReverbNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'reverb',
    processorName: 'reverb-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      decay: params.decay ?? 2.0,
      damping: params.damping ?? 0.5,
      mix: params.mix ?? 0.3,
    },
  });
}
