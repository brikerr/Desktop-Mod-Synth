import type { ModuleType } from '../../types/index.ts';

export interface BaseNodeOptions {
  moduleType: ModuleType;
  processorName: string;
  numberOfInputs: number;
  numberOfOutputs: number;
  outputChannelCount?: number[];
  parameterData?: Record<string, number>;
}

export function createWorkletNode(
  ctx: AudioContext,
  options: BaseNodeOptions,
): AudioWorkletNode {
  const node = new AudioWorkletNode(ctx, options.processorName, {
    numberOfInputs: options.numberOfInputs,
    numberOfOutputs: options.numberOfOutputs,
    outputChannelCount: options.outputChannelCount,
    channelCount: 1,
    channelCountMode: 'explicit',
    channelInterpretation: 'discrete',
    parameterData: options.parameterData,
  });
  (node as any).__moduleType = options.moduleType;
  return node;
}
