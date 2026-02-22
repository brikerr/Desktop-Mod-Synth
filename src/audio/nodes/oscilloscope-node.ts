import { createWorkletNode } from './base-node.ts';

export function createOscilloscopeNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'oscilloscope',
    processorName: 'oscilloscope-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      timeDiv: params.timeDiv ?? 5,
      triggerLevel: params.triggerLevel ?? 0,
      freeze: params.freeze ?? 0,
    },
  });
}
