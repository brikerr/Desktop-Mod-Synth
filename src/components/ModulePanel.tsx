import React, { useCallback, useRef, useState } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
import { getModuleColor } from '../styles/module-colors.ts';
import { useTheme } from '../store/theme-store.ts';
import { ModuleAccentContext } from './controls/ModuleAccentContext.tsx';
import Port from './controls/Port.tsx';
import Tooltip from './hints/Tooltip.tsx';
import PatchSuggestion from './hints/PatchSuggestion.tsx';
import type { PortDefinition } from '../types/index.ts';

interface ModulePanelProps {
  moduleId: string;
  children: React.ReactNode;
}

const ModulePanel: React.FC<ModulePanelProps> = ({ moduleId, children }) => {
  const module = useSynthStore((s) => s.modules[moduleId]);
  const removeModule = useSynthStore((s) => s.removeModule);
  const moveModule = useSynthStore((s) => s.moveModule);
  const startCable = useSynthStore((s) => s.startCable);
  const completeCable = useSynthStore((s) => s.completeCable);
  const theme = useTheme();

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );
  const labelRef = useRef<HTMLSpanElement>(null);
  const [labelHoverRect, setLabelHoverRect] = useState<DOMRect | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      moveModule(moduleId, {
        x: dragRef.current.origX + dx,
        y: dragRef.current.origY + dy,
      });
    },
    [moduleId, moveModule],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, [handleMouseMove]);

  const handleHeaderMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origX: module.x,
        origY: module.y,
      };
      setIsDragging(true);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    },
    [module.x, module.y, handleMouseMove, handleMouseUp],
  );

  const handleDelete = useCallback(() => {
    removeModule(moduleId);
  }, [moduleId, removeModule]);

  const handlePortClick = useCallback(
    (_moduleId: string, portId: string, direction: 'input' | 'output', signal: PortDefinition['signal'], _element: HTMLDivElement) => {
      if (direction === 'output') {
        startCable({ moduleId, portId }, signal);
      } else {
        completeCable({ moduleId, portId });
      }
    },
    [moduleId, startCable, completeCable],
  );

  if (!module) return null;

  const definition = getModuleDefinition(module.type);
  const colors = getModuleColor(module.type);
  const inputPorts = definition.ports.filter((p) => p.direction === 'input');
  const outputPorts = definition.ports.filter((p) => p.direction === 'output');

  return (
    <ModuleAccentContext.Provider value={colors}>
      <div style={{
        minWidth: 200,
        background: theme.bgPanel,
        borderRadius: theme.borderRadius,
        border: `1px solid ${isDragging ? colors.primary : theme.borderSubtle}`,
        boxShadow: isDragging ? `0 0 12px ${colors.primary}40` : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme.bgPanelHeader,
            borderBottom: `3px solid ${colors.primary}`,
            padding: '4px 8px',
            cursor: 'grab',
            userSelect: 'none',
          }}
          onMouseDown={handleHeaderMouseDown}
        >
          <span
            ref={labelRef}
            style={{
              color: theme.textPrimary,
              fontSize: theme.fontSize,
              fontWeight: 600,
              fontFamily: theme.fontBase,
              letterSpacing: 0.5,
              textTransform: 'uppercase',
              cursor: 'help',
            }}
            onMouseEnter={() => {
              if (labelRef.current && definition.description) {
                setLabelHoverRect(labelRef.current.getBoundingClientRect());
              }
            }}
            onMouseLeave={() => setLabelHoverRect(null)}
          >
            {definition.label}
            {labelHoverRect && definition.description && (
              <Tooltip anchorRect={labelHoverRect} maxWidth={260}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{definition.label}</div>
                <div style={{ color: theme.textSecondary, fontSize: theme.fontSizeLabel }}>
                  {definition.detailedDescription || definition.description}
                </div>
              </Tooltip>
            )}
          </span>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: theme.deleteButton,
              cursor: 'pointer',
              padding: 0,
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
            }}
            onClick={handleDelete}
            title="Remove module"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close_small</span>
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'row',
          padding: 6,
          gap: 6,
          alignItems: 'flex-start',
        }}>
          {inputPorts.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'flex-start',
              minWidth: 40,
            }}>
              {inputPorts.map((port) => (
                <div key={port.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                  <Port
                    portId={port.id}
                    moduleId={moduleId}
                    label={port.name}
                    direction={port.direction}
                    signal={port.signal}
                    portDef={port}
                    onPortClick={handlePortClick}
                  />
                  <PatchSuggestion moduleId={moduleId} portId={port.id} direction={port.direction} />
                </div>
              ))}
            </div>
          )}

          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>{children}</div>

          {outputPorts.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              alignItems: 'flex-end',
              minWidth: 40,
            }}>
              {outputPorts.map((port) => (
                <div key={port.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                  <Port
                    portId={port.id}
                    moduleId={moduleId}
                    label={port.name}
                    direction={port.direction}
                    signal={port.signal}
                    portDef={port}
                    onPortClick={handlePortClick}
                  />
                  <PatchSuggestion moduleId={moduleId} portId={port.id} direction={port.direction} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ModuleAccentContext.Provider>
  );
};

export default ModulePanel;
