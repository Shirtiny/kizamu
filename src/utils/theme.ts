export enum ColorThemes {
  DARK = 'dark',
  LIGHT = 'light',
}

const THEME_STORAGE_KEY = 'kizamu-theme';

// 在 SVG 中，我们将圆形的中心点从 `cx="0" cy="0"` 改为 `cx="0" cy="40"`。这将圆形移动到 SVG 视口的左下角。
const viewTransitionStyleCSS = `
*{transition: unset !important;}  
::view-transition-group(root) {
  animation-timing-function: 0.7s;
}
::view-transition-new(root) {
  mask: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><defs><filter id="blur"><feGaussianBlur stdDeviation="2"/></filter></defs><circle cx="40" cy="0" r="18" fill="white" filter="url(%23blur)"/></svg>') top right / 0 no-repeat;
  mask-origin: content-box;
  animation: scale 0.7s;
  transform-origin: top right;
}
::view-transition-old(root),.dark::view-transition-old(root) {
  animation: scale 0.7s;
  transform-origin: top right;
  z-index: -1;
}
@keyframes scale {
  to {
      mask-size: 350vmax;
  }
}

`;

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? ColorThemes.DARK
    : ColorThemes.LIGHT;
}

const getTheme = (): ColorThemes => {
  return (localStorage.getItem(THEME_STORAGE_KEY) as ColorThemes) || getSystemTheme();
};

const setTheme = async (themeColor: ColorThemes) => {
  const viewTransitionStyleElement = document.createElement('style');
  viewTransitionStyleElement.textContent = viewTransitionStyleCSS;
  document.head.appendChild(viewTransitionStyleElement);

  const update = () => {
    const htmlEl = document.querySelector('html')!;
    htmlEl.setAttribute('data-theme', themeColor);
    localStorage.setItem(THEME_STORAGE_KEY, themeColor);
  };

  if (!document.startViewTransition) {
    update();
    return;
  }

  const transition = document.startViewTransition(() => {
    update();
  });

  await transition.finished;

  document.head.removeChild(viewTransitionStyleElement);
};

const toggleTheme = () => {
  const curTheme = getTheme();
  const newTheme = curTheme === ColorThemes.LIGHT ? ColorThemes.DARK : ColorThemes.LIGHT;
  setTheme(newTheme);
  return newTheme;
};

const theme = { getTheme, setTheme, toggleTheme };

export default theme;
