import { createWorkletNode } from './base-node.ts';

export function createVCFNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'vcf',
    processorName: 'vcf-processor',
    numberOfInputs: 3,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      cutoff: params.cutoff ?? 0.7,
      cutoffModDepth: params.cutoffModDepth ?? 0.5,
      resonance: params.resonance ?? 0.1,
      resonanceModDepth: params.resonanceModDepth ?? 0,
      mode: params.mode ?? 0,
    },
  });
}
