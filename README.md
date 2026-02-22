# Mod-Synth

A browser-based modular synthesizer built with React, TypeScript, and the Web Audio API. Patch virtual cables between modules to build synthesizer voices from scratch — no plugins or installs required.

## Overview

Mod-Synth recreates the experience of hardware modular synthesis in the browser. Drag modules onto a virtual rack, twist knobs, and connect patch cables between ports to route audio and control signals. Everything runs in real-time using AudioWorklet processors at 44.1kHz.

A default patch (Keyboard → VCO → VCF → VCA → Output with Envelope) loads on startup so you can play immediately, then modify and expand from there.

## Features

### 12 Module Types

**Sound Sources**
- **VCO** — Voltage-controlled oscillator with sine, saw, square, and triangle waveforms. Supports FM synthesis and pulse width modulation via CV inputs.
- **Noise** — White and pink noise generator for percussion, textures, and effects.
- **LFO** — Low-frequency oscillator for adding vibrato, tremolo, filter wobble, and other cyclic modulation.
- **Keyboard** — Converts computer keyboard input into 1V/oct pitch CV and gate signals across two octaves (C3–B4).

**Signal Processing**
- **VCF** — Voltage-controlled filter with lowpass, highpass, and bandpass modes. Cutoff and resonance are CV-modulatable.
- **VCA** — Voltage-controlled amplifier for shaping note dynamics, typically driven by an envelope.
- **Mixer** — 4-channel audio mixer with individual gain controls and a master output.
- **Envelope** — ADSR envelope generator triggered by gate signals for shaping volume and filter contours.

**Effects**
- **Delay** — Echo effect with adjustable time, feedback, and dry/wet mix. Time CV input enables chorus-like modulation.
- **Reverb** — Simulates room reflections with decay and damping controls.

**Utility**
- **Oscilloscope** — Real-time waveform display with trigger level, time division, and freeze controls. Signal passes through unchanged.
- **Output** — Stereo output to speakers/headphones with master volume control.

### Patch Cable System

- Click an output port, then click an input port to create a connection
- Cables are color-coded by signal type: red (audio), cyan (CV), yellow (gate)
- Catenary cable sag with glow effects for visual clarity
- Signal type validation prevents incompatible connections
- Click a cable to remove it

### Interactive Controls

- **Knobs** — Vertical drag interaction with 270-degree arc visualization and tick marks
- **Sliders** — For envelope ADSR and mixer channel gains
- **Selectors** — Dropdown menus for waveform and filter mode selection
- **Pan & Zoom** — Scroll to zoom (0.25x–2.0x), drag the background to pan the rack

### Guidance System

- **Port tooltips** — Hover any port to see its name, signal type, description, and suggested connections
- **Module descriptions** — Italic subtitle on each module; hover for a detailed explanation
- **Patch suggestions** — Subtle hints next to unconnected ports suggesting what to connect based on rack state
- **First-add tips** — One-time toast notification when you add a new module type for the first time

### Playable Keyboard

- Two-octave on-screen piano (C3–B4)
- Computer keyboard mapping: `A W S E D F T G Y H U J K L`
- Mouse/touch support with visual feedback
- Octave shift control

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript 5.9 |
| State | Zustand 5 |
| Audio | Web Audio API, AudioWorklet |
| Build | Vite 7 |
| Lint | ESLint with TypeScript plugin |

All audio processing runs in dedicated AudioWorklet threads — 12 custom processors handle synthesis, filtering, effects, and analysis with per-sample accuracy.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build
```

Open the app in your browser, click **Start Audio**, and play the keyboard. The default patch is ready to go — modify it or build your own from scratch using the module toolbar.

## Project Structure

```
src/
├── audio/
│   ├── context.ts              # AudioContext singleton
│   ├── engine.ts               # Module factory & lifecycle
│   ├── graph/
│   │   ├── connection-manager.ts   # Cable graph management
│   │   └── port-registry.ts        # Module/port definitions
│   ├── nodes/                  # Node creators per module type
│   └── processors/             # 12 AudioWorkletProcessor implementations
├── components/
│   ├── Toolbar.tsx             # Module palette & audio init
│   ├── Rack.tsx                # Pan/zoom canvas
│   ├── Keyboard.tsx            # Piano keyboard
│   ├── Cables.tsx              # SVG cable rendering
│   ├── ModulePanel.tsx         # Generic module container
│   ├── modules/                # 12 module panel UIs
│   ├── controls/               # Knob, Slider, Port, Select
│   └── hints/                  # Tooltips, descriptions, suggestions
├── store/
│   ├── synth-store.ts          # Main application state
│   └── toast-store.ts          # Notification state
├── types/                      # TypeScript interfaces
├── styles/                     # Module color definitions
├── hints/                      # Patching suggestion algorithm
└── hooks/                      # First-add tip tracker
```

## Roadmap

### Near-term
- [ ] MIDI input support (external controllers and keyboards)
- [ ] Preset save/load system (export and import patches as JSON)
- [ ] Undo/redo for patch changes and module operations
- [ ] Module duplication (clone a module with its current parameter settings)
- [ ] Cable routing improvements (avoid overlapping cables, drag to reposition)

### Mid-term
- [ ] Additional modules: sequencer, sample & hold, quantizer, clock divider, wavefolder
- [ ] Stereo signal path throughout (stereo VCO, stereo effects)
- [ ] Audio file playback module (load and trigger samples)
- [ ] Recording/export to WAV
- [ ] Customizable keyboard mapping and extended octave range
- [ ] Module parameter automation via sequencer

### Long-term
- [ ] Collaborative patching (real-time multiplayer via WebRTC)
- [ ] User module library (share presets and patches)
- [ ] Visual signal flow debugging (highlight active cables, show signal levels)
- [ ] Mobile/touch-optimized interface
- [ ] PWA support for offline use
- [ ] Custom AudioWorklet module authoring (user-defined DSP)

## License

This project is provided as-is for educational and personal use.
