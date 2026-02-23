import React, { useRef, useState } from 'react';
import Tooltip from './Tooltip.tsx';
import { useTheme } from '../../store/theme-store.ts';

interface ModuleDescriptionProps {
  description?: string;
  detailedDescription?: string;
}

const ModuleDescription: React.FC<ModuleDescriptionProps> = ({ description, detailedDescription }) => {
  const theme = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  if (!description) return null;

  return (
    <div
      ref={ref}
      style={{
        padding: '2px 8px 4px',
        fontSize: theme.fontSizeLabel,
        fontStyle: 'italic',
        color: theme.textMuted,
        fontFamily: theme.fontBase,
        lineHeight: 1.3,
        cursor: detailedDescription ? 'help' : 'default',
      }}
      onMouseEnter={() => {
        if (ref.current && detailedDescription) {
          setHoverRect(ref.current.getBoundingClientRect());
        }
      }}
      onMouseLeave={() => setHoverRect(null)}
    >
      {description}
      {hoverRect && detailedDescription && (
        <Tooltip anchorRect={hoverRect} maxWidth={280}>
          <div style={{ color: theme.textPrimary, fontSize: theme.fontSize }}>{detailedDescription}</div>
        </Tooltip>
      )}
    </div>
  );
};

export default ModuleDescription;
