import React, { useCallback, useEffect, useMemo, useState } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode, ThemeColors, darkColors, lightColors } from '@/constants/theme';

export type ThemeContextValue = {
  mode: ThemeMode;
  colors: ThemeColors;
  toggle: () => void;
  setMode: (m: ThemeMode) => void;
};

export const [ThemeProvider, useTheme] = createContextHook<ThemeContextValue>(() => {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('theme-mode');
        if (stored === 'light' || stored === 'dark') {
          setModeState(stored as ThemeMode);
        }
      } catch (e) {
        console.log('ThemeProvider: read error', e);
      }
    })();
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem('theme-mode', m).catch(err => console.log('ThemeProvider: write error', err));
  }, []);

  const toggle = useCallback(() => {
    setModeState((prev: ThemeMode) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('theme-mode', next).catch(err => console.log('ThemeProvider: write error', err));
      return next;
    });
  }, []);

  const colors = useMemo<ThemeColors>(() => (mode === 'dark' ? darkColors : lightColors), [mode]);

  const value = useMemo<ThemeContextValue>(() => ({ mode, colors, toggle, setMode }), [mode, colors, toggle, setMode]);

  return value;
});
