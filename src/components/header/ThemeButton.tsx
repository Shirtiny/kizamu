import clsx from 'clsx';
import { themeAtom } from '@/store/theme';
import { useAtom } from 'jotai';
import { ColorThemes } from '@/utils/theme';

function ThemeButton() {
  const [theme, setTheme] = useAtom(themeAtom);

  const light = theme === ColorThemes.LIGHT;

  const handleClick = () => {
    setTheme(light ? ColorThemes.DARK : ColorThemes.LIGHT);
  };

  return (
    <button
      className="size-9 rounded-full shadow-lg shadow-zinc-800/5 border border-primary bg-white/50 dark:bg-zinc-800/50 backdrop-blur"
      type="button"
      aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
      onClick={handleClick}
    >
      <i className={clsx('iconfont', light ? 'icon-moon' : 'icon-sun')}></i>
    </button>
  );
}

export default ThemeButton;
