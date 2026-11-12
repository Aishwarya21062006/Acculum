import { createContext, useContext, type ReactNode } from 'react';
import type { ThemeConfig, Theme } from '@/data/onboardingTypes';
import { getTheme } from '@/data/themes';

interface ThemeContextValue {
  theme: ThemeConfig;
  isCricket: boolean;
  isNormal: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: getTheme('normal'),
  isCricket: false,
  isNormal: true,
});

export function ThemeProvider({
  children,
  themeName,
}: {
  children: ReactNode;
  themeName: Theme;
}) {
  const theme = getTheme(themeName);
  return (
    <ThemeContext.Provider
      value={{ theme, isCricket: themeName === 'cricket', isNormal: themeName === 'normal' }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
