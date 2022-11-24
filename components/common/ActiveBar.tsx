import {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { styled } from "@linaria/react";
import { useSpring, animated, config, SpringRef } from "@react-spring/web";
import dom from "@shirtiny/utils/lib/dom";
import lang from "@shirtiny/utils/lib/lang";
import logger from "../../utils/logger";

const calcBarStyle = (el: HTMLElement) => {
  const height = el.offsetHeight / 2;
  return {
    y: el.offsetTop + height / 2,
    height,
  };
};

interface ISpringApiProperties {
  y: number;
  height: number;
}

const useActiveBarListener = (arg: {
  elRef: MutableRefObject<HTMLDivElement | null>;
  springApi: SpringRef<ISpringApiProperties>;
  enable: boolean;
}) => {
  const { elRef, springApi, enable } = arg;

  const itemClickListener = useCallback(
    (e: Event) => {
      logger.log("click bar item");

      const el = e.target as HTMLElement;
      if (!el) return;
      springApi.start(calcBarStyle(el));
    },
    [springApi]
  );

  // init
  useEffect(() => {
    if (!enable) return;

    const activeBarNode = elRef.current;
    logger.doms("ActiveBar node", activeBarNode);
    if (!activeBarNode) return;
    const container = activeBarNode.parentElement;
    const firstChild = container?.firstElementChild as HTMLDivElement;
    logger.doms("ActiveBar container", container, firstChild);
    if (!container || !firstChild || firstChild === activeBarNode) return;
    logger.log("add activeBar listener");
    Array.from(container.children).forEach((node) => {
      activeBarNode !== node &&
        node.addEventListener("click", itemClickListener);
    });
    // update spring
    springApi.set(calcBarStyle(firstChild));
    return () => {
      logger.log("remove activeBar listener");
      Array.from(container.children).forEach((node) => {
        activeBarNode !== node &&
          node.removeEventListener("click", itemClickListener);
      });
    };
  }, [springApi, itemClickListener, elRef, enable]);
};

const StyledActiveBar = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #fb7575;
  width: 0.1875rem;
  /* height: 0rem; */
  /* height: 5.625rem; */
  border-radius: 0.1875rem;
`;

interface IActiveBarProps {
  activeKeyAttributeName?: string;
  currentActiveIndex?: string | number;
  auto?: boolean;
  onActiveEnd?: Function;
}

const ATTRIBUTE_SUFFIX = "item";

const formateActiveIndex = (index?: number | string) => {
  if (lang.isNullOrUndefined(index)) return "";
  return `sh-${index}-${ATTRIBUTE_SUFFIX}`;
};

const ActiveBar: FC<IActiveBarProps> = ({
  activeKeyAttributeName = "data-active-bar-key",
  currentActiveIndex,
  auto = false,
  onActiveEnd,
}) => {
  const currentActiveKey = formateActiveIndex(currentActiveIndex);

  const elRef = useRef<HTMLDivElement | null>(null);

  const loadRef = useCallback(
    (el: HTMLDivElement) => {
      elRef.current = el;
      const container = el.parentElement;
      if (!container) return;
      Array.from(container.children).forEach((node, index) => {
        if (node instanceof Element) {
          node.setAttribute(activeKeyAttributeName, formateActiveIndex(index));
        }
      });
    },
    [activeKeyAttributeName]
  );

  const handleActiveEnd = useCallback(() => {
    onActiveEnd && onActiveEnd();
  }, [onActiveEnd]);

  const [styles, springApi] = useSpring<ISpringApiProperties>(() => ({
    y: 0,
    height: 0,

    config: config.gentle,
    onRest: () => {
      handleActiveEnd();
    },
  }));

  useActiveBarListener({
    elRef,
    springApi,
    enable: auto,
  });

  // current active
  useEffect(() => {
    logger.debug("switch activeBar", { currentActiveKey });
    const container = elRef.current?.parentElement;
    if (!container) return;
    const currentActiveNode =
      currentActiveKey &&
      container.querySelector(
        `[${activeKeyAttributeName}=${currentActiveKey}]`
      );
    // update spring
    currentActiveNode &&
      springApi.start(calcBarStyle(currentActiveNode as HTMLElement));
  }, [activeKeyAttributeName, currentActiveKey, springApi]);

  return (
    <StyledActiveBar ref={loadRef} style={{ ...styles }}></StyledActiveBar>
  );
};

export default memo(ActiveBar);