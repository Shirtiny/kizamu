import { FC, ReactNode, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import component from "@/hoc/component";

const StyledA = styled.a``;

interface IProps {
  className: string;
  href: string;
  children?: ReactNode;
  [attr: string]: any;
}

const Link: FC<IProps> = ({
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

export default component<IProps>(Link);
