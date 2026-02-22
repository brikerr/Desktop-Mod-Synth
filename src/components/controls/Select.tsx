import React, { useCallback } from 'react';

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

/** Styled dropdown select for enum-like parameters. */
const Select: React.FC<SelectProps> = ({ label, value, options, onChange }) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange(Number(e.target.value));
    },
    [onChange],
  );

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    userSelect: 'none',
  };

  const labelStyle: React.CSSProperties = {
    color: '#a0a0b0',
    fontSize: 10,
    fontFamily: 'sans-serif',
    textAlign: 'center',
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
  };

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#2a2a4a',
    color: '#e0e0e0',
    border: '1px solid #333366',
    borderRadius: 3,
    padding: '2px 4px',
    fontSize: 11,
    fontFamily: 'sans-serif',
    outline: 'none',
    cursor: 'pointer',
    minWidth: 48,
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage:
      'url("data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="5" viewBox="0 0 8 5">' +
          '<path d="M0 0 L4 5 L8 0 Z" fill="#a0a0b0"/>' +
          '</svg>',
      ) +
      '")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 4px center',
    paddingRight: 16,
  };

  return (
    <div style={containerStyle}>
      <span style={labelStyle}>{label}</span>
      <select style={selectStyle} value={value} onChange={handleChange}>
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
