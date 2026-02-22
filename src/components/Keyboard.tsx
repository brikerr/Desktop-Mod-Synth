import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme } from '../store/theme-store.ts';

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

const KEYS = buildKeys(48, 71);
const WHITE_KEYS = KEYS.filter((k) => !k.isBlack);
const BLACK_KEYS = KEYS.filter((k) => k.isBlack);

const KEY_MAP: Record<string, number> = {
  a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66,
  g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, l: 74,
};

const WHITE_KEY_W = 40;
const BLACK_KEY_W = 24;
const KEYBOARD_H = 120;
const WHITE_KEY_H = KEYBOARD_H - 8;
const BLACK_KEY_H = WHITE_KEY_H * 0.6;

export function Keyboard() {
  const noteOn = useSynthStore((s) => s.noteOn);
  const noteOff = useSynthStore((s) => s.noteOff);
  const theme = useTheme();

  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const activeNotesRef = useRef<Set<number>>(new Set());
  const mouseNoteRef = useRef<number | null>(null);

  const keysDownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (keysDownRef.current.has(key)) return;
      const midi = KEY_MAP[key];
      if (midi !== undefined) {
        keysDownRef.current.add(key);
        activeNotesRef.current.add(midi);
        setActiveNotes(new Set(activeNotesRef.current));
        noteOn(midi);
      }
    }
    function handleKeyUp(e: KeyboardEvent) {
      const key = e.key.toLowerCase();
      if (!keysDownRef.current.has(key)) return;
      keysDownRef.current.delete(key);
      const midi = KEY_MAP[key];
      if (midi !== undefined) {
        activeNotesRef.current.delete(midi);
        setActiveNotes(new Set(activeNotesRef.current));
        noteOff(midi);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [noteOn, noteOff]);

  const handlePointerDown = useCallback(
    (midi: number, e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      mouseNoteRef.current = midi;
      activeNotesRef.current.add(midi);
      setActiveNotes(new Set(activeNotesRef.current));
      noteOn(midi);
    },
    [noteOn],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      const midi = mouseNoteRef.current;
      if (midi === null) return;
      mouseNoteRef.current = null;
      activeNotesRef.current.delete(midi);
      setActiveNotes(new Set(activeNotesRef.current));
      noteOff(midi);
    },
    [noteOff],
  );

  useEffect(() => {
    function globalUp() {
      const midi = mouseNoteRef.current;
      if (midi !== null) {
        mouseNoteRef.current = null;
        activeNotesRef.current.delete(midi);
        setActiveNotes(new Set(activeNotesRef.current));
        noteOff(midi);
      }
    }
    window.addEventListener('pointerup', globalUp);
    return () => window.removeEventListener('pointerup', globalUp);
  }, [noteOff]);

  const totalWidth = WHITE_KEYS.length * WHITE_KEY_W;

  return (
    <div style={{
      height: KEYBOARD_H,
      background: theme.bgKeyboard,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      position: 'relative',
      flexShrink: 0,
      userSelect: 'none',
      touchAction: 'none',
      borderTop: `1px solid ${theme.borderSubtle}`,
    }}>
      <div style={{ position: 'relative', height: WHITE_KEY_H, width: totalWidth }}>
        {WHITE_KEYS.map((key, i) => {
          const active = activeNotes.has(key.midiNote);
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
                background: active ? theme.whiteKeyActive : theme.whiteKey,
                borderRadius: `0 0 ${theme.borderRadius}px ${theme.borderRadius}px`,
                border: `1px solid ${theme.keyBorder}`,
                boxSizing: 'border-box',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'background 0.05s',
              }}
            />
          );
        })}
        {BLACK_KEYS.map((key) => {
          const active = activeNotes.has(key.midiNote);
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
                background: active ? theme.blackKeyActive : theme.blackKey,
                borderRadius: `0 0 ${theme.borderRadius}px ${theme.borderRadius}px`,
                border: `1px solid ${theme.keyBorder}`,
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
