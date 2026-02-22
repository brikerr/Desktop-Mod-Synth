import { createWorkletNode } from './base-node.ts';

export function createVCONode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'vco',
    processorName: 'vco-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      frequency: params.frequency ?? 0,
      waveform: params.waveform ?? 0,
      fmDepth: params.fmDepth ?? 0,
      pulseWidth: params.pulseWidth ?? 0.5,
      pwmDepth: params.pwmDepth ?? 0,
    },
  });
}
