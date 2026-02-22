import React, { useRef, useState } from 'react';
import Tooltip from './Tooltip.tsx';

interface ModuleDescriptionProps {
  description?: string;
  detailedDescription?: string;
}

const ModuleDescription: React.FC<ModuleDescriptionProps> = ({ description, detailedDescription }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);

  if (!description) return null;

  return (
    <div
      ref={ref}
      style={{
        padding: '2px 10px 4px',
        fontSize: 10,
        fontStyle: 'italic',
        color: '#a0a0b080',
        fontFamily: 'sans-serif',
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
          <div style={{ color: '#d0d0e0', fontSize: 11 }}>{detailedDescription}</div>
        </Tooltip>
      )}
    </div>
  );
};

export default ModuleDescription;
