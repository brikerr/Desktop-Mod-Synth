import { createWorkletNode } from './base-node.ts';

export function createLFONode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'lfo',
    processorName: 'lfo-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      rate: params.rate ?? 2,
      depth: params.depth ?? 0.5,
      waveform: params.waveform ?? 0,
      rateModDepth: params.rateModDepth ?? 0,
    },
  });
}
