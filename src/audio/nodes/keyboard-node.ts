import { createWorkletNode } from './base-node.ts';

export function createKeyboardNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'keyboard',
    processorName: 'keyboard-processor',
    numberOfInputs: 0,
    numberOfOutputs: 8,
    outputChannelCount: [1, 1, 1, 1, 1, 1, 1, 1],
    parameterData: {
      octave: params.octave ?? 0,
    },
  });
}
