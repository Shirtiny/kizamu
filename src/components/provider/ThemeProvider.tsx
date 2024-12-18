import { useAtomValue } from 'jotai';
import { useLayoutEffect } from 'react';
import theme, { ColorThemes } from '@/utils/theme';
import { themeAtom } from '@/store/theme';

export function ThemeProvider() {
  const curTheme = useAtomValue(themeAtom);

  function handlePrefersColorSchemeChange(event: MediaQueryListEvent) {
    theme.setTheme(event.matches ? ColorThemes.DARK : ColorThemes.LIGHT);
  }

  useLayoutEffect(() => {
    theme.setTheme(curTheme);

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    query.addEventListener('change', handlePrefersColorSchemeChange);

    return () => {
      query.removeEventListener('change', handlePrefersColorSchemeChange);
    };
  }, [curTheme]);

  return null;
}
