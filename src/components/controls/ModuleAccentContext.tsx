import { createContext, useContext } from 'react';

export interface AccentColors {
  primary: string;
  secondary: string;
}

const defaultAccent: AccentColors = { primary: '#e94560', secondary: '#ff6b81' };

export const ModuleAccentContext = createContext<AccentColors>(defaultAccent);

export function useAccentColor(): AccentColors {
  return useContext(ModuleAccentContext);
}
