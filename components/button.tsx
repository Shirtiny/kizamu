import { styled } from "@linaria/react";
import { FC, ReactNode } from "react";

const StyledButton = styled.button``;

interface IProps {
  children?: ReactNode;
}

const Button: FC<IProps> = ({ children }) => {
  return <StyledButton>{children}</StyledButton>;
};

export default Button;
