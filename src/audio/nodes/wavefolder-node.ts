import { createWorkletNode } from './base-node.ts';

export function createWavefolderNode(ctx: AudioContext, params: Record<string, number>): AudioWorkletNode {
  return createWorkletNode(ctx, {
    moduleType: 'wavefolder',
    processorName: 'wavefolder-processor',
    numberOfInputs: 2,
    numberOfOutputs: 1,
    outputChannelCount: [1],
    parameterData: {
      drive: params.drive ?? 1,
      folds: params.folds ?? 1,
      mix: params.mix ?? 1.0,
      symmetry: params.symmetry ?? 0.5,
      foldModDepth: params.foldModDepth ?? 0,
    },
  });
}
