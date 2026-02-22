import type { ModuleType, PortRef } from '../types/index.ts';
import { getAudioContext, initAudioContext } from './context.ts';
import { loadAllProcessors } from './worklet-loader.ts';
import { ConnectionManager } from './graph/connection-manager.ts';
import { getModuleDefinition } from './graph/port-registry.ts';
import { createVCONode } from './nodes/vco-node.ts';
import { createVCFNode } from './nodes/vcf-node.ts';
import { createVCANode } from './nodes/vca-node.ts';
import { createEnvelopeNode } from './nodes/envelope-node.ts';
import { createLFONode } from './nodes/lfo-node.ts';
import { createMixerNode } from './nodes/mixer-node.ts';
import { createKeyboardNode } from './nodes/keyboard-node.ts';
import { createOutputNode } from './nodes/output-node.ts';
import { createNoiseNode } from './nodes/noise-node.ts';
import { createDelayNode } from './nodes/delay-node.ts';
import { createReverbNode } from './nodes/reverb-node.ts';
import { createOscilloscopeNode } from './nodes/oscilloscope-node.ts';

export class AudioEngine {
  private nodes = new Map<string, AudioWorkletNode>();
  private connectionManager: ConnectionManager;
  private initialized = false;

  constructor() {
    this.connectionManager = new ConnectionManager(this.nodes);
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    const ctx = await initAudioContext();
    await loadAllProcessors(ctx);
    this.initialized = true;
  }

  isReady(): boolean {
    return this.initialized;
  }

  createModule(id: string, type: ModuleType, params: Record<string, number>): void {
    const ctx = getAudioContext();
    let node: AudioWorkletNode;

    switch (type) {
      case 'vco':
        node = createVCONode(ctx, params);
        break;
      case 'vcf':
        node = createVCFNode(ctx, params);
        break;
      case 'vca':
        node = createVCANode(ctx, params);
        break;
      case 'envelope':
        node = createEnvelopeNode(ctx, params);
        break;
      case 'lfo':
        node = createLFONode(ctx, params);
        break;
      case 'mixer':
        node = createMixerNode(ctx, params);
        break;
      case 'keyboard':
        node = createKeyboardNode(ctx, params);
        break;
      case 'output':
        node = createOutputNode(ctx, params);
        break;
      case 'noise':
        node = createNoiseNode(ctx, params);
        break;
      case 'delay':
        node = createDelayNode(ctx, params);
        break;
      case 'reverb':
        node = createReverbNode(ctx, params);
        break;
      case 'oscilloscope':
        node = createOscilloscopeNode(ctx, params);
        break;
      default:
        throw new Error(`Unknown module type: ${type}`);
    }

    this.nodes.set(id, node);
  }

  destroyModule(id: string): string[] {
    const removedConnections = this.connectionManager.disconnectAllForModule(id);
    const node = this.nodes.get(id);
    if (node) {
      node.disconnect();
      this.nodes.delete(id);
    }
    return removedConnections;
  }

  setParam(moduleId: string, paramName: string, value: number): void {
    const node = this.nodes.get(moduleId);
    if (!node) return;
    const param = node.parameters.get(paramName);
    if (param) {
      const ctx = getAudioContext();
      param.setValueAtTime(value, ctx.currentTime);
    }
  }

  connect(connectionId: string, source: PortRef, dest: PortRef): string {
    const signalType = this.connectionManager.connect(connectionId, source, dest);
    return signalType;
  }

  disconnect(connectionId: string): void {
    this.connectionManager.disconnect(connectionId);
  }

  getNode(moduleId: string): AudioWorkletNode | undefined {
    return this.nodes.get(moduleId);
  }

  noteOn(keyboardModuleId: string, midiNote: number): void {
    const node = this.nodes.get(keyboardModuleId);
    if (node) {
      node.port.postMessage({ type: 'noteOn', note: midiNote });
    }
  }

  noteOff(keyboardModuleId: string): void {
    const node = this.nodes.get(keyboardModuleId);
    if (node) {
      node.port.postMessage({ type: 'noteOff' });
    }
  }
}

export const audioEngine = new AudioEngine();
