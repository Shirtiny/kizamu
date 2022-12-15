import { constSelector } from "recoil";

export enum ColorThemes {
  FASHION = "fashion",
  MIKU = "miku",
}

const switchTheme = (themeColor: ColorThemes) => {
  const htmlEl = document.querySelector("html")!;
  htmlEl.setAttribute("data-theme", themeColor);
};

const theme = { switchTheme };

export default theme;
