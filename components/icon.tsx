import { styled } from "@linaria/react";
import { memo, ReactNode, FC } from "react";
import { style } from "@shirtiny/utils/lib";
const { clsPainPattern } = style;

const StyledIcon = styled.span`
  .react-icon {
    vertical-align: middle;
    color: #848484;
  }

  &.size-small {
    font-size: 0.875rem;
  }
  &.size-middle {
    font-size: 1.125rem;
  }
  &.size-large {
    font-size: 1.5rem;
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
