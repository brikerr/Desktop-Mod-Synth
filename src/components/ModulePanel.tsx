import React, { useCallback, useRef } from 'react';
import { useSynthStore } from '../store/synth-store.ts';
import { getModuleDefinition } from '../audio/graph/port-registry.ts';
import { getModuleColor } from '../styles/module-colors.ts';
import { ModuleAccentContext } from './controls/ModuleAccentContext.tsx';
import Port from './controls/Port.tsx';
import ModuleDescription from './hints/ModuleDescription.tsx';
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

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(
    null,
  );

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

  // --- Styles ---
  const panelStyle: React.CSSProperties = {
    minWidth: 200,
    background: '#0f3460',
    borderRadius: 6,
    boxShadow: `0 4px 12px rgba(0,0,0,0.5), 0 0 1px ${colors.primary}40`,
    border: `1px solid ${colors.primary}30`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    padding: '6px 10px',
    cursor: 'grab',
    userSelect: 'none',
  };

  const titleStyle: React.CSSProperties = {
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'sans-serif',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
  };

  const deleteButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    cursor: 'pointer',
    padding: '0 4px',
    lineHeight: 1,
  };

  const bodyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    padding: 8,
    gap: 8,
    alignItems: 'flex-start',
  };

  const portColumnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    alignItems: 'center',
    minWidth: 40,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  };

  return (
    <ModuleAccentContext.Provider value={colors}>
      <div style={panelStyle}>
        <div style={headerStyle} onMouseDown={handleHeaderMouseDown}>
          <span style={titleStyle}>{definition.label}</span>
          <button style={deleteButtonStyle} onClick={handleDelete} title="Remove module">
            X
          </button>
        </div>

        <ModuleDescription
          description={definition.description}
          detailedDescription={definition.detailedDescription}
        />

        <div style={bodyStyle}>
          {/* Input ports column */}
          {inputPorts.length > 0 && (
            <div style={portColumnStyle}>
              {inputPorts.map((port) => (
                <div key={port.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
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

          {/* Module-specific controls */}
          <div style={contentStyle}>{children}</div>

          {/* Output ports column */}
          {outputPorts.length > 0 && (
            <div style={portColumnStyle}>
              {outputPorts.map((port) => (
                <div key={port.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
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
