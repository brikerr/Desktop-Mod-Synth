import React, { useCallback, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { useTheme } from '../store/theme-store.ts';
import { factoryPresets } from '../presets/factory-presets.ts';
import {
  loadUserPresets,
  addUserPreset,
  removeUserPreset,
  setActivePresetId,
} from '../presets/preset-storage.ts';
import { captureCurrentState, validatePreset } from '../presets/preset-utils.ts';
import type { Preset, PresetCategory } from '../presets/types.ts';

const CATEGORY_LABELS: Record<PresetCategory, string> = {
  keys: 'Keys',
  bass: 'Bass',
  lead: 'Lead',
  pad: 'Pad',
  percussion: 'Percussion',
  fx: 'FX',
  sequencer: 'Sequencer',
  utility: 'Utility',
};

export function PresetSelector() {
  const theme = useTheme();
  const isAudioReady = useSynthStore((s) => s.isAudioReady);
  const loadPreset = useSynthStore((s) => s.loadPreset);
  const activePresetId = useSynthStore((s) => s.activePresetId);
  const modules = useSynthStore((s) => s.modules);
  const connections = useSynthStore((s) => s.connections);

  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const userPresets = loadUserPresets();

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSaving(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const handleLoadPreset = useCallback(async (preset: Preset) => {
    setOpen(false);
    await loadPreset(preset);
  }, [loadPreset]);

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    const preset = captureCurrentState(
      modules,
      connections,
      saveName.trim(),
      '',
      'utility' as PresetCategory,
    );
    addUserPreset(preset);
    setSaving(false);
    setSaveName('');
    useSynthStore.setState({ activePresetId: preset.id });
    setActivePresetId(preset.id);
  }, [saveName, modules, connections]);

  const handleDelete = useCallback((e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    removeUserPreset(id);
    if (activePresetId === id) {
      useSynthStore.setState({ activePresetId: null });
      setActivePresetId(null);
    }
  }, [activePresetId]);

  const handleExport = useCallback(() => {
    const preset = captureCurrentState(modules, connections, 'Export', '', 'utility');
    const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mod-synth-preset.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }, [modules, connections]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!validatePreset(data)) {
        alert('Invalid preset file.');
        return;
      }
      // Assign new ID and mark as user preset
      const preset: Preset = {
        ...data,
        id: `user_${Date.now()}`,
        isFactory: false,
      };
      addUserPreset(preset);
      await loadPreset(preset);
    } catch {
      alert('Failed to read preset file.');
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setOpen(false);
  }, [loadPreset]);

  const disabled = !isAudioReady;
  const isOpen = open && !disabled;

  const btnStyle: React.CSSProperties = {
    background: disabled
      ? `${theme.bgControl}66`
      : isOpen
        ? theme.borderControl
        : hovered === 'btn'
          ? `${theme.borderControl}88`
          : theme.bgControl,
    color: disabled ? theme.textMuted : theme.textPrimary,
    border: `1px solid ${isOpen ? theme.textMuted : theme.borderSubtle}`,
    padding: '6px 12px',
    borderRadius: 10,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 12,
    fontFamily: theme.fontBase,
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    opacity: disabled ? 0.3 : 1,
  };

  const itemStyle = (key: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '7px 12px',
    background: hovered === key ? `${theme.borderControl}66` : 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    color: theme.textPrimary,
    fontSize: 11,
    fontFamily: theme.fontBase,
    transition: 'background 0.1s ease',
    textAlign: 'left' as const,
  });

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 9,
    fontFamily: theme.fontBase,
    color: theme.textMuted,
    padding: '6px 12px 2px',
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        disabled={disabled}
        style={btnStyle}
        onMouseEnter={() => setHovered('btn')}
        onMouseLeave={() => setHovered(null)}
        onClick={() => !disabled && setOpen((p) => !p)}
      >
        Preset
        <span
          className="material-symbols-outlined"
          style={{
            fontSize: 16,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            background: theme.glassBg,
            border: `1px solid ${theme.glassBorder}`,
            borderRadius: theme.panelRadius,
            boxShadow: theme.glassShadow,
            padding: '6px',
            zIndex: 1000,
            minWidth: 220,
            maxHeight: 440,
            overflowY: 'auto',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          {/* Factory presets */}
          <div style={sectionLabelStyle}>Factory</div>
          {factoryPresets.map((p) => (
            <button
              key={p.id}
              style={itemStyle(`f-${p.id}`)}
              onMouseEnter={() => setHovered(`f-${p.id}`)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleLoadPreset(p)}
            >
              {activePresetId === p.id && (
                <span className="material-symbols-outlined" style={{ fontSize: 14, color: theme.audioReady }}>
                  check
                </span>
              )}
              <span style={{ flex: 1 }}>{p.name}</span>
              <span style={{ fontSize: 9, color: theme.textMuted }}>
                {CATEGORY_LABELS[p.category]}
              </span>
            </button>
          ))}

          {/* User presets */}
          {userPresets.length > 0 && (
            <>
              <div style={{ height: 1, background: theme.borderSubtle, margin: '4px 8px' }} />
              <div style={sectionLabelStyle}>My Presets</div>
              {userPresets.map((p) => (
                <button
                  key={p.id}
                  style={itemStyle(`u-${p.id}`)}
                  onMouseEnter={() => setHovered(`u-${p.id}`)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => handleLoadPreset(p)}
                >
                  {activePresetId === p.id && (
                    <span className="material-symbols-outlined" style={{ fontSize: 14, color: theme.audioReady }}>
                      check
                    </span>
                  )}
                  <span style={{ flex: 1 }}>{p.name}</span>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: 14,
                      color: theme.textMuted,
                      opacity: hovered === `u-${p.id}` ? 1 : 0,
                      transition: 'opacity 0.1s',
                    }}
                    onClick={(e) => handleDelete(e, p.id)}
                    title="Delete preset"
                  >
                    close
                  </span>
                </button>
              ))}
            </>
          )}

          {/* Divider */}
          <div style={{ height: 1, background: theme.borderSubtle, margin: '4px 8px' }} />

          {/* Save */}
          {saving ? (
            <div style={{ padding: '6px 8px', display: 'flex', gap: 4 }}>
              <input
                autoFocus
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Preset name..."
                style={{
                  flex: 1,
                  background: theme.bgControl,
                  border: `1px solid ${theme.borderSubtle}`,
                  borderRadius: 6,
                  padding: '4px 8px',
                  color: theme.textPrimary,
                  fontSize: 11,
                  fontFamily: theme.fontBase,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  background: theme.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontFamily: theme.fontBase,
                  cursor: 'pointer',
                }}
              >
                Save
              </button>
            </div>
          ) : (
            <button
              style={itemStyle('save')}
              onMouseEnter={() => setHovered('save')}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSaving(true)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>save</span>
              Save Current...
            </button>
          )}

          {/* Export */}
          <button
            style={itemStyle('export')}
            onMouseEnter={() => setHovered('export')}
            onMouseLeave={() => setHovered(null)}
            onClick={handleExport}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>download</span>
            Export to File...
          </button>

          {/* Import */}
          <button
            style={itemStyle('import')}
            onMouseEnter={() => setHovered('import')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>upload</span>
            Import from File...
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImport}
          />
        </div>
      )}
    </div>
  );
}
