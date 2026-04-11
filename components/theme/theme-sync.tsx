'use client';

import { useEffect } from 'react';
import { useDashboardStore } from '../../src/store/useDashboardStore';

export function ThemeSync() {
  const themeMode = useDashboardStore((state) => state.themeMode);
  const themePreference = useDashboardStore((state) => state.themePreference);
  const syncSystemTheme = useDashboardStore((state) => state.syncSystemTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themePreference === 'system') {
        syncSystemTheme();
      }
    };

    handleChange();
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [syncSystemTheme, themePreference]);

  return null;
}
