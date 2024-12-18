import theme from '@/utils/theme';
import { atom } from 'jotai';

export const themeAtom = atom(theme.getTheme());
