import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';

// ---------- note layout helpers ----------

interface KeyInfo {
  midiNote: number;
  isBlack: boolean;
  label: string;
  whiteIndex: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function buildKeys(startNote: number, endNote: number): KeyInfo[] {
  const keys: KeyInfo[] = [];
  let whiteIdx = 0;
  for (let midi = startNote; midi <= endNote; midi++) {
    const semitone = midi % 12;
    const isBlack = [1, 3, 6, 8, 10].includes(semitone);
    const octave = Math.floor(midi / 12) - 1;
    keys.push({
      midiNote: midi,
      isBlack,
      label: `${NOTE_NAMES[semitone]}${octave}`,
      whiteIndex: isBlack ? whiteIdx - 1 : whiteIdx,
    });
    if (!isBlack) whiteIdx++;
  }
  return keys;
}

// C3 (48) to B4 (71) — two octaves
const KEYS = buildKeys(48, 71);
const WHITE_KEYS = KEYS.filter((k) => !k.isBlack);
const BLACK_KEYS = KEYS.filter((k) => k.isBlack);

// ---------- keyboard-to-MIDI mapping ----------

const KEY_MAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66,
  g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, l: 74,
};

// ---------- dimensions ----------

const WHITE_KEY_W = 40;
const BLACK_KEY_W = 24;
const KEYBOARD_H = 120;
const WHITE_KEY_H = KEYBOARD_H - 8;
const BLACK_KEY_H = WHITE_KEY_H * 0.6;

// ---------- component ----------

export function Keyboard() {
  const noteOn = useSynthStore((s) => s.noteOn);
  const noteOff = useSynthStore((s) => s.noteOff);

  const [activeNote, setActiveNote] = useState<number | null>(null);
  const activeNoteRef = useRef<number | null>(null);
  const mouseDownRef = useRef(false);

  // --- computer keyboard input ---
  const keysDownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keysDownRef.current.has(key)) return;
      const midi = KEY_MAP[key];
      if (midi !== undefined) {
        keysDownRef.current.add(key);
        setActiveNote(midi);
        activeNoteRef.current = midi;
        noteOn(midi);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!keysDownRef.current.has(key)) return;
      keysDownRef.current.delete(key);
      const midi = KEY_MAP[key];
      if (midi !== undefined && activeNoteRef.current === midi) {
        setActiveNote(null);
        activeNoteRef.current = null;
        noteOff();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteOn, noteOff]);

  // --- mouse handlers (use pointer events for reliability) ---

  const handlePointerDown = useCallback(
    (midi: number, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // Capture pointer so we get pointerup even if mouse leaves the key
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      mouseDownRef.current = true;
      activeNoteRef.current = midi;
      setActiveNote(midi);
      noteOn(midi);
    },
    [noteOn],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      if (!mouseDownRef.current) return;
      mouseDownRef.current = false;
      activeNoteRef.current = null;
      setActiveNote(null);
      noteOff();
    },
    [noteOff],
  );

  // Global pointer up as safety net
  useEffect(() => {
    function globalUp() {
      if (mouseDownRef.current) {
        mouseDownRef.current = false;
        activeNoteRef.current = null;
        setActiveNote(null);
        noteOff();
      }
    }
    window.addEventListener('pointerup', globalUp);
    return () => window.removeEventListener('pointerup', globalUp);
  }, [noteOff]);

  const totalWidth = WHITE_KEYS.length * WHITE_KEY_W;

  return (
    <div style={{
      height: KEYBOARD_H,
      background: '#16213e',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
      userSelect: 'none',
      touchAction: 'none',
    }}>
      <div style={{ position: 'relative', height: WHITE_KEY_H, width: totalWidth }}>
        {WHITE_KEYS.map((key, i) => {
          const active = activeNote === key.midiNote;
          return (
            <div
              key={key.midiNote}
              onPointerDown={(e) => handlePointerDown(key.midiNote, e)}
              onPointerUp={handlePointerUp}
              style={{
                position: 'absolute',
                left: i * WHITE_KEY_W,
                top: 0,
                width: WHITE_KEY_W - 2,
                height: WHITE_KEY_H,
                background: active ? '#4ecdc4' : '#e0e0e0',
                borderRadius: '0 0 4px 4px',
                border: '1px solid #333',
                boxSizing: 'border-box',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'background 0.05s',
              }}
            />
          );
        })}
        {BLACK_KEYS.map((key) => {
          const active = activeNote === key.midiNote;
          const left = (key.whiteIndex + 1) * WHITE_KEY_W - BLACK_KEY_W / 2;
          return (
            <div
              key={key.midiNote}
              onPointerDown={(e) => handlePointerDown(key.midiNote, e)}
              onPointerUp={handlePointerUp}
              style={{
                position: 'absolute',
                left,
                top: 0,
                width: BLACK_KEY_W,
                height: BLACK_KEY_H,
                background: active ? '#e94560' : '#1a1a2e',
                borderRadius: '0 0 3px 3px',
                border: '1px solid #111',
                boxSizing: 'border-box',
                cursor: 'pointer',
                zIndex: 2,
                transition: 'background 0.05s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
