"use client";
import {
  FC,
  ReactNode,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import { IconContext } from "react-icons/lib";
import styled, { createGlobalStyle } from "styled-components";
import reactiveX from "@shirtiny/utils/lib/reactiveX";
import dev from "@shirtiny/utils/lib/dev";
import theme, { ColorThemes } from "@/styles/theme";
import component from "@/hoc/component";
import layout from "@/utils/layout";
import logger from "@/utils/logger";
import "modern-normalize/modern-normalize.css";
import "@fontsource/lexend";
import "@fontsource/chilanka";
import "@fontsource/jetbrains-mono";

const GlobalStyle = createGlobalStyle`
    html,
    body {
      padding: 0;
      margin: 0;
      
      font-family: "JetBrains Mono", monospace, -apple-system,
        BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell,
        Fira Sans, Droid Sans, Helvetica Neue, sans-serif;

      /* font-family: "JetBrains Mono", monospace; */
      /* "Chilanka", cursive */
      /* "Lexend", sans-serif,*/
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    * {
      box-sizing: border-box;
      /* will-change: background-color, color; */
    }

    html[data-theme="fashion"]:root {
      --color-primary: #ff7576;
      --color-primary-light: #ff9b9c;
      --color-primary-dark: #ff4e4f;
      --color-primary-background-color: #fdfdfd;
      --color-primary-background-color-dark: #f6f6f6;
      --color-primary-text: #8b8b8b;
      --color-primary-text-light: #fff;
      --color-primary-text-dark: #848484;
      --color-primary-text-lighter: #fff;
      --color-primary-text-darker: #fff;
    }

    html[data-theme="miku"]:root {
      --color-primary: #00b7c3;
      --color-primary-light: #00d9e6;
      --color-primary-dark: #0097a3;
      --color-primary-background-color: #fdfdfd;
      --color-primary-background-color-dark: #f6f6f6;
      --color-primary-text: #8b8b8b;
      --color-primary-text-light: #fff;
      --color-primary-text-dark: #848484;
      --color-primary-text-lighter: #fff;
      --color-primary-text-darker: #fff;
    }
    
    .root-app-layout {
      font-size: .16rem;
    }

    .flex-space {
      flex: 1;
    }

`;

const StyledAppLayout = styled.div``;

interface IProps {
  children?: ReactNode;
}

(window as any).dev = dev;
logger.log("dev key taskMap");

const AppLayout: FC<IProps> = ({ children }) => {
  const loadRef = useCallback((node: HTMLDivElement) => {
    logger.component("AppLayout", "loadRef", node);
  }, []);

  useLayoutEffect(() => {
    if (!window) return;
    layout.remFlexible(window, 1920, 100, 1000);
  }, []);

  useEffect(() => {
    const task = reactiveX.createTimerTask({
      name: "themeSwitchTimer",
      sec: 5,
      request: async (index: number) => {
        logger.log("themeSwitchTimer", index);
        theme.switchTheme(
          index % 2 === 0 ? ColorThemes.FASHION : ColorThemes.MIKU
        );
        return true;
      },
    });
    task.start();
  }, []);

  return (
    <StyledAppLayout ref={loadRef}>
      <GlobalStyle />
      <IconContext.Provider value={{ className: "react-icon", style: {} }}>
        {children}
      </IconContext.Provider>
    </StyledAppLayout>
  );
};

export default component<IProps>(AppLayout);