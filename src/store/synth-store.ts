import { create } from 'zustand';
import type { ModuleType, ModuleInstance, CableConnection, PortRef, SignalType } from '../types/index.ts';
import { audioEngine } from '../audio/engine.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';

let nextModuleId = 1;
let nextConnectionId = 1;
let nextModuleX = 60;

function generateModuleId(): string {
  return `mod_${nextModuleId++}`;
}

function generateConnectionId(): string {
  return `conn_${nextConnectionId++}`;
}

interface PendingCable {
  source: PortRef;
  signalType: SignalType;
}

interface SynthStore {
  modules: Record<string, ModuleInstance>;
  connections: Record<string, CableConnection>;
  isAudioReady: boolean;
  pendingCable: PendingCable | null;

  initAudio: () => Promise<void>;
  addModule: (type: ModuleType) => string;
  addModuleAt: (type: ModuleType, x: number, y: number) => string;
  removeModule: (id: string) => void;
  moveModule: (id: string, pos: { x: number; y: number }) => void;
  updateParam: (moduleId: string, paramName: string, value: number) => void;
  addConnection: (source: PortRef, dest: PortRef) => string;
  removeConnection: (id: string) => void;
  startCable: (source: PortRef, signalType: SignalType) => void;
  cancelCable: () => void;
  completeCable: (dest: PortRef) => string | null;
  setupDefaultPatch: () => void;
  noteOn: (midiNote: number) => void;
  noteOff: () => void;
}

export const useSynthStore = create<SynthStore>((set, get) => ({
  modules: {},
  connections: {},
  isAudioReady: false,
  pendingCable: null,

  initAudio: async () => {
    try {
      await audioEngine.init();
      set({ isAudioReady: true });
      // Auto-setup default patch if no modules exist
      if (Object.keys(get().modules).length === 0) {
        get().setupDefaultPatch();
      }
    } catch (err) {
      console.error('Failed to initialize audio:', err);
    }
  },

  addModule: (type: ModuleType): string => {
    const id = generateModuleId();
    const def = getModuleDefinition(type);
    const instance: ModuleInstance = {
      id,
      type,
      x: nextModuleX,
      y: 80,
      params: { ...def.defaultParams },
    };
    nextModuleX += 240;
    if (nextModuleX > 1200) nextModuleX = 60;

    set((state) => ({
      modules: { ...state.modules, [id]: instance },
    }));

    if (get().isAudioReady) {
      audioEngine.createModule(id, type, instance.params);
    }

    return id;
  },

  addModuleAt: (type: ModuleType, x: number, y: number): string => {
    const id = generateModuleId();
    const def = getModuleDefinition(type);
    const instance: ModuleInstance = {
      id,
      type,
      x,
      y,
      params: { ...def.defaultParams },
    };

    set((state) => ({
      modules: { ...state.modules, [id]: instance },
    }));

    if (get().isAudioReady) {
      audioEngine.createModule(id, type, instance.params);
    }

    return id;
  },

  removeModule: (id: string) => {
    // Remove connections for this module
    const state = get();
    const removedConnectionIds = audioEngine.destroyModule(id);

    const newConnections = { ...state.connections };
    for (const connId of removedConnectionIds) {
      delete newConnections[connId];
    }
    // Also remove any store-side connections
    for (const [connId, conn] of Object.entries(newConnections)) {
      if (conn.source.moduleId === id || conn.dest.moduleId === id) {
        delete newConnections[connId];
      }
    }

    const newModules = { ...state.modules };
    delete newModules[id];

    set({
      modules: newModules,
      connections: newConnections,
      pendingCable: state.pendingCable?.source.moduleId === id ? null : state.pendingCable,
    });
  },

  moveModule: (id: string, pos: { x: number; y: number }) => {
    set((state) => ({
      modules: {
        ...state.modules,
        [id]: { ...state.modules[id], ...pos },
      },
    }));
  },

  updateParam: (moduleId: string, paramName: string, value: number) => {
    set((state) => ({
      modules: {
        ...state.modules,
        [moduleId]: {
          ...state.modules[moduleId],
          params: { ...state.modules[moduleId].params, [paramName]: value },
        },
      },
    }));

    if (get().isAudioReady) {
      audioEngine.setParam(moduleId, paramName, value);
    }
  },

  addConnection: (source: PortRef, dest: PortRef): string => {
    const id = generateConnectionId();
    // Get signal type from source port
    const state = get();
    const sourceModule = state.modules[source.moduleId];
    const sourceDef = getModuleDefinition(sourceModule.type);
    const sourcePort = sourceDef.ports.find((p) => p.id === source.portId);
    const signalType: SignalType = sourcePort?.signal ?? 'audio';

    const connection: CableConnection = { id, source, dest, signalType };

    if (get().isAudioReady) {
      audioEngine.connect(id, source, dest);
    }

    set((state) => ({
      connections: { ...state.connections, [id]: connection },
    }));

    return id;
  },

  removeConnection: (id: string) => {
    if (get().isAudioReady) {
      audioEngine.disconnect(id);
    }

    set((state) => {
      const newConnections = { ...state.connections };
      delete newConnections[id];
      return { connections: newConnections };
    });
  },

  startCable: (source: PortRef, signalType: SignalType) => {
    set({ pendingCable: { source, signalType } });
  },

  cancelCable: () => {
    set({ pendingCable: null });
  },

  completeCable: (dest: PortRef): string | null => {
    const { pendingCable } = get();
    if (!pendingCable) return null;

    // Don't connect to same module
    if (pendingCable.source.moduleId === dest.moduleId) {
      set({ pendingCable: null });
      return null;
    }

    // Check if connection already exists
    const existing = Object.values(get().connections).find(
      (c) =>
        c.source.moduleId === pendingCable.source.moduleId &&
        c.source.portId === pendingCable.source.portId &&
        c.dest.moduleId === dest.moduleId &&
        c.dest.portId === dest.portId,
    );
    if (existing) {
      set({ pendingCable: null });
      return null;
    }

    set({ pendingCable: null });
    return get().addConnection(pendingCable.source, dest);
  },

  setupDefaultPatch: () => {
    const s = get();
    // Classic subtractive voice layout:
    //   Keyboard → VCO → VCF → VCA → Output
    //   Envelope → VCA (cv), Keyboard gate → Envelope
    const kbd  = s.addModuleAt('keyboard', 40,  60);
    const vco  = s.addModuleAt('vco',      300, 40);
    const vcf  = s.addModuleAt('vcf',      560, 40);
    const env  = s.addModuleAt('envelope', 300, 340);
    const vca  = s.addModuleAt('vca',      820, 60);
    const out  = s.addModuleAt('output',   1060, 60);

    // Keyboard pitch → VCO pitch
    s.addConnection({ moduleId: kbd, portId: 'pitch_cv_out' }, { moduleId: vco, portId: 'pitch_cv' });
    // Keyboard gate → Envelope gate
    s.addConnection({ moduleId: kbd, portId: 'gate_out' }, { moduleId: env, portId: 'gate_in' });
    // VCO → VCF
    s.addConnection({ moduleId: vco, portId: 'audio_out' }, { moduleId: vcf, portId: 'audio_in' });
    // VCF → VCA
    s.addConnection({ moduleId: vcf, portId: 'audio_out' }, { moduleId: vca, portId: 'audio_in' });
    // Envelope → VCA CV
    s.addConnection({ moduleId: env, portId: 'envelope_out' }, { moduleId: vca, portId: 'cv_in' });
    // VCA → Output left
    s.addConnection({ moduleId: vca, portId: 'audio_out' }, { moduleId: out, portId: 'audio_in_left' });

    nextModuleX = 40;
  },

  noteOn: (midiNote: number) => {
    const state = get();
    // Find all keyboard modules and send noteOn
    for (const mod of Object.values(state.modules)) {
      if (mod.type === 'keyboard') {
        audioEngine.noteOn(mod.id, midiNote);
      }
    }
  },

  noteOff: () => {
    const state = get();
    for (const mod of Object.values(state.modules)) {
      if (mod.type === 'keyboard') {
        audioEngine.noteOff(mod.id);
      }
    }
  },
}));
