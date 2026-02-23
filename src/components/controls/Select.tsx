import React, { useCallback } from 'react';
import { useTheme } from '../../store/theme-store.ts';

interface SelectOption {
  value: number;
  label: string;
}

interface SelectProps {
  label: string;
  value: number;
  options: SelectOption[];
  onChange: (value: number) => void;
}

const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
  const theme = useTheme();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const arrowColor = encodeURIComponent(theme.textSecondary);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      userSelect: 'none',
    }}>
      <span style={{
        color: theme.textSecondary,
        fontSize: theme.fontSizeLabel,
        fontFamily: theme.fontBase,
        textAlign: 'center',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}>{label}</span>
      <select
        style={{
          backgroundColor: theme.bgControl,
          color: theme.textPrimary,
          border: `1px solid ${theme.borderControl}`,
          borderRadius: theme.borderRadius,
          padding: '2px 4px',
          fontSize: theme.fontSize,
          fontFamily: theme.fontBase,
          outline: 'none',
          cursor: 'pointer',
          minWidth: 48,
          appearance: 'none',
          WebkitAppearance: 'none',
          backgroundImage:
            `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5"><path d="M0 0 L4 5 L8 0 Z" fill="${arrowColor}"/></svg>`,
            )}")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 4px center',
          paddingRight: 16,
        }}
        value={value}
        onChange={handleChange}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
