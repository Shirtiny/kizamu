import {
  FC,
  memo,
  useCallback,
  useEffect,
  useRef,
  MutableRefObject,
  useMemo,
} from "react";
import { styled } from "@linaria/react";
import { useSpring, animated, config, SpringRef } from "@react-spring/web";
import dom from "@shirtiny/utils/lib/dom";
import logger from "../../utils/logger";

interface ISpringApiProperties {
  y: number;
  height: number;
}

const useActiveBarListener = (arg: {
  elRef: MutableRefObject<HTMLDivElement | null>;
  springApi: SpringRef<ISpringApiProperties>;
}) => {
  const { elRef, springApi } = arg;

  const calcBarStyle = useCallback((el: HTMLElement) => {
    const height = el.offsetHeight / 2;
    return {
      y: el.offsetTop + height / 2,
      height,
    };
  }, []);

  const itemClickListener = useCallback(
    (e: Event) => {
      logger.log("click bar item");

      const el = e.target as HTMLElement;
      if (!el) return;
      springApi.start(calcBarStyle(el));
    },
    [calcBarStyle, springApi]
  );

  useEffect(() => {
    const activeBarNode = elRef.current;
    logger.doms("ActiveBar node", activeBarNode);
    if (!activeBarNode) return;
    const container = activeBarNode.parentElement;
    const firstChild = container?.firstElementChild as HTMLDivElement;
    logger.doms("ActiveBar container", container, firstChild);
    if (!container || !firstChild || firstChild === activeBarNode) return;
    logger.log("add activeBar listener");
    container.childNodes.forEach((node) => {
      activeBarNode !== node &&
        node.addEventListener("click", itemClickListener);
    });
    // update spring
    springApi.set(calcBarStyle(firstChild));
    return () => {
      logger.log("remove activeBar listener");
      container.childNodes.forEach((node) => {
        activeBarNode !== node &&
          node.removeEventListener("click", itemClickListener);
      });
    };
  }, [springApi, itemClickListener, elRef, calcBarStyle]);
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

const ActiveBar: FC = ({}) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  const handleActiveEnd = useCallback(() => {
    logger.log("active");
  }, []);

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
  });

  return <StyledActiveBar ref={elRef} style={{ ...styles }}></StyledActiveBar>;
};

export default memo(ActiveBar);
