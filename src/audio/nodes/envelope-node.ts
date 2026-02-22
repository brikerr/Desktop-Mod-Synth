import { createWorkletNode } from './base-node.ts';

export function createEnvelopeNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'envelope',
    processorName: 'envelope-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      attack: params.attack ?? 0.01,
      decay: params.decay ?? 0.3,
      sustain: params.sustain ?? 0.7,
      release: params.release ?? 0.5,
    },
  });
}
