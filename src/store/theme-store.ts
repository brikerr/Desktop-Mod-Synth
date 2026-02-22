import { create } from 'zustand';
import { darkTheme, lightTheme } from '../styles/theme-tokens.ts';
import type { ThemeTokens } from '../styles/theme-tokens.ts';

type ThemeName = 'dark' | 'light';

interface ThemeStore {
  themeName: ThemeName;
  toggleTheme: () => void;
}

function loadTheme(): ThemeName {
  try {
    const stored = localStorage.getItem('mod-synth-theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  return 'dark';
}

function applyDataTheme(name: ThemeName) {
  document.documentElement.dataset.theme = name;
}

const initialTheme = loadTheme();
applyDataTheme(initialTheme);

export const useThemeStore = create<ThemeStore>((set) => ({
  themeName: initialTheme,
  toggleTheme: () =>
    set((s) => {
      const next: ThemeName = s.themeName === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mod-synth-theme', next);
      applyDataTheme(next);
      return { themeName: next };
    }),
}));

export function useTheme(): ThemeTokens {
  const themeName = useThemeStore((s) => s.themeName);
  return themeName === 'dark' ? darkTheme : lightTheme;
}
