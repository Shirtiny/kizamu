import { FC, memo, useCallback, useRef } from "react";
import { styled } from "@linaria/react";
import { useSpring, animated } from "@react-spring/web";
import dom from "@shirtiny/utils/lib/dom";

const StyledActiveBar = styled(animated.div)`
  position: absolute;
  top: 0;
  right: 0;
  background-color: #fb7575;
  width: 0.1875rem;
  height: 5.625rem;
`;

const ActiveBar: FC = ({}) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  const animatedProp = useSpring({
    transform: `translateY(${0}px)`,
    from: {
      transform: `translateY(${0}px)`,
    },
  });

  const loadRef = useCallback((el: HTMLDivElement | null) => {
    console.dir(el);
    elRef.current = el;
    const container = el?.parentElement;
    if (!container || !container.firstElementChild) return;
  }, []);

  return <StyledActiveBar ref={loadRef} style={animatedProp}></StyledActiveBar>;
};

export default memo(ActiveBar);
