import { FC, memo, ReactNode, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const StyledA = styled.a``;

interface ILinkProps {
  className: string;
  href: string;
  children?: ReactNode;
  [attr: string]: any;
}

const Link: FC<ILinkProps> = ({
  className,
  href,
  children,
  ...rest
}) => {
  const navigate = useNavigate();

  const handleClick = useCallback(
    (e: any) => {
      navigate(href);
    },
    [navigate, href]
  );

  return (
    <StyledA className={className} onClick={handleClick} {...rest}>
      {children}
    </StyledA>
  );
};

export default memo(Link);
