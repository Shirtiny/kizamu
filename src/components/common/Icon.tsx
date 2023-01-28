import styled from "styled-components";
import { memo, ReactNode, FC } from "react";
import { clsPainPattern } from "@shirtiny/utils/lib/style";

const StyledIcon = styled.span`
  .react-icon {
    vertical-align: middle;
    color: var(--color-primary-text-dark);
  }

  &.size-small {
    font-size: .16rem;
  }
  &.size-middle {
    font-size: .2rem;
  }
  &.size-large {
    font-size: .24rem;
  }
`;

interface IProps {
  Svg: ReactNode;
  size?: "small" | "middle" | "large";
}

const Icon: FC<IProps> = ({ Svg, size = "middle" }) => {
  const className = clsPainPattern({
    size,
  });
  return <StyledIcon className={className}>{Svg}</StyledIcon>;
};

export default memo(Icon);
