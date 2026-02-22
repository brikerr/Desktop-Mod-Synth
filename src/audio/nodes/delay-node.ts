import { createWorkletNode } from './base-node.ts';

export function createDelayNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'delay',
    processorName: 'delay-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      time: params.time ?? 0.3,
      feedback: params.feedback ?? 0.4,
      mix: params.mix ?? 0.5,
      timeModDepth: params.timeModDepth ?? 0,
    },
  });
}
