import { createWorkletNode } from './base-node.ts';

export function createSpectrumNode(ctx: AudioContext, _params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'spectrum',
    processorName: 'spectrum-processor',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {},
  });
}
