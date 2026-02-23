import { useSynthStore } from '../store/synth-store.ts';

export interface MIDIDeviceInfo {
  id: string;
  name: string;
}

class MIDIManager {
  private midiAccess: MIDIAccess | null = null;
  private activeInput: MIDIInput | null = null;
  private boundHandler: ((e: MIDIMessageEvent) => void) | null = null;
  private _connected = false;
  private _deviceName = '';
  private listeners: Array<() => void> = [];

  get connected(): boolean {
    return this._connected;
  }

  get deviceName(): string {
    return this._deviceName;
  }

  async init(): Promise<void> {
    if (!navigator.requestMIDIAccess) {
      console.warn('Web MIDI API not supported');
      return;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess();
      this.midiAccess.onstatechange = () => this.autoConnect();
      this.autoConnect();
    } catch (err) {
      console.warn('MIDI access denied:', err);
    }
  }

  shutdown(): void {
    if (this.activeInput && this.boundHandler) {
      this.activeInput.removeEventListener('midimessage', this.boundHandler as EventListener);
    }
    this.activeInput = null;
    this.boundHandler = null;
    this.midiAccess = null;
    this._connected = false;
    this._deviceName = '';
    this.notifyListeners();
  }

  getInputs(): MIDIDeviceInfo[] {
    if (!this.midiAccess) return [];
    const devices: MIDIDeviceInfo[] = [];
    this.midiAccess.inputs.forEach((input) => {
      devices.push({ id: input.id, name: input.name || 'Unknown MIDI Device' });
    });
    return devices;
  }

  selectInput(id: string): void {
    if (!this.midiAccess) return;

    // Remove old listener
    if (this.activeInput && this.boundHandler) {
      this.activeInput.removeEventListener('midimessage', this.boundHandler as EventListener);
    }

    const input = this.midiAccess.inputs.get(id);
    if (!input) return;

    this.activeInput = input;
    this.boundHandler = this.onMIDIMessage.bind(this);
    input.addEventListener('midimessage', this.boundHandler as EventListener);
    this._connected = true;
    this._deviceName = input.name || 'MIDI Device';
    this.notifyListeners();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    for (const l of this.listeners) l();
  }

  private autoConnect(): void {
    if (!this.midiAccess) return;

    // If already connected to a valid input, keep it
    if (this.activeInput && this._connected) {
      const stillExists = this.midiAccess.inputs.get(this.activeInput.id);
      if (stillExists) return;
    }

    // Auto-connect to first available input
    const inputs = this.getInputs();
    if (inputs.length > 0) {
      this.selectInput(inputs[0].id);
    } else {
      this._connected = false;
      this._deviceName = '';
      this.notifyListeners();
    }
  }

  private onMIDIMessage(e: MIDIMessageEvent): void {
    const data = e.data;
    if (!data || data.length < 2) return;

    const status = data[0] & 0xf0;
    const note = data[1];
    const velocity = data.length > 2 ? data[2] : 0;

    const store = useSynthStore.getState();

    if (status === 0x90 && velocity > 0) {
      // Note On
      store.noteOn(note);
    } else if (status === 0x80 || (status === 0x90 && velocity === 0)) {
      // Note Off
      store.noteOff(note);
    }
  }
}

export const midiManager = new MIDIManager();
