import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  MutableRefObject,
} from "react";
import { styled } from "@linaria/react";
import { useSpring, animated, config, SpringRef } from "@react-spring/web";
import { kebabCase, camelCase } from "lodash";
import dom from "@shirtiny/utils/lib/dom";
import lang from "@shirtiny/utils/lib/lang";
import logger from "../../utils/logger";
import inject from "../../hoc/inject";

const ATTRIBUTE_SUFFIX = "item";

const formateActiveIndex = (index?: number | string): string => {
  if (lang.isNullOrUndefined(index)) return "";
  if (String(index).endsWith(`-${ATTRIBUTE_SUFFIX}`)) return String(index);
  return `sh-${index}-${ATTRIBUTE_SUFFIX}`;
};

const formateActiveKeyAttributeName = (
  activeKeyDataSetName: string
): string => {
  return `data-${kebabCase(activeKeyDataSetName)}`;
};

const createBarItemSelector = (
  activeKeyAttributeName: string,
  activeIndex?: number | string
): string => {
  const value = lang.isNullOrUndefined(activeIndex)
    ? ""
    : `=${formateActiveIndex(activeIndex)}`;
  return `[${activeKeyAttributeName}${value}]`;
};

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
  activeKeyAttributeName: string;
  enable: boolean;
}) => {
  const { elRef, springApi, enable, activeKeyAttributeName } = arg;

  const containerClickListener = useCallback(
    (e: Event) => {
      logger.log("click bar container");
      const el = e.target as HTMLElement;
      const barItemEl = el.closest(
        createBarItemSelector(activeKeyAttributeName)
      );
      logger.doms("bar container", e.target, e.currentTarget, barItemEl);
      if (!barItemEl) return;
      springApi.start(calcBarStyle(el));
    },
    [activeKeyAttributeName, springApi]
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
    container.addEventListener("click", containerClickListener);
    // update spring
    springApi.set(calcBarStyle(firstChild));
    return () => {
      logger.log("remove activeBar listener");
      container.removeEventListener("click", containerClickListener);
    };
  }, [springApi, containerClickListener, elRef, enable]);
};

const StyledActiveBar = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--color-primary);
  width: 0.1875rem;
  /* height: 0rem; */
  /* height: 5.625rem; */
  border-radius: 0.1875rem;
`;

interface IActiveBarProps {
  activeKeyDataSetName?: string;
  currentActiveIndex?: string | number;
  auto?: boolean;
  onActiveEnd?: Function;
}

const ActiveBar: FC<IActiveBarProps> = ({
  activeKeyDataSetName = "active-bar-key",
  currentActiveIndex,
  auto = false,
  onActiveEnd,
}) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  const { currentActiveKey, activeKeyAttributeName } = useMemo(() => {
    return {
      currentActiveKey: formateActiveIndex(currentActiveIndex),
      activeKeyAttributeName:
        formateActiveKeyAttributeName(activeKeyDataSetName),
    };
  }, [currentActiveIndex, activeKeyDataSetName]);

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
    activeKeyAttributeName,
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
        createBarItemSelector(activeKeyAttributeName, currentActiveKey)
      );
    // update spring
    currentActiveNode &&
      springApi.start(calcBarStyle(currentActiveNode as HTMLElement));
  }, [activeKeyAttributeName, currentActiveKey, springApi]);

  return (
    <StyledActiveBar ref={loadRef} style={{ ...styles }}></StyledActiveBar>
  );
};

export default memo(
  inject(ActiveBar, (props) => {
    return { activeKeyDataSetName: camelCase(props.activeKeyDataSetName) };
  })
);
