import { FC, memo, ReactNode, useCallback } from "react";
import { styled } from "@linaria/react";
import { useNavigate } from "react-router-dom";

const StyledA = styled.a``;

interface ILinkProps {
  className: string;
  href: string;
  children?: ReactNode;
}

const Link: FC<ILinkProps> = ({ className, href, children }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate(href);
  }, [navigate, href]);

  return (
    <StyledA className={className} onClick={handleClick}>
      {children}
    </StyledA>
  );
};

export default memo(Link);
