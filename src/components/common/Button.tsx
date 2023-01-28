import { FC, MouseEventHandler, ReactNode } from "react";
import styled from "styled-components";
import { clsPainPattern } from "@shirtiny/utils/lib/style";
import component from "@/hoc/component";

interface IStyledProps {}

const StyledButton = styled.button<Partial<IStyledProps>>`
  appearance: "none";
  background-image: none;
  outline: none;
  position: relative;
  display: inline-block;
  white-space: nowrap;
  text-align: center;
  cursor: pointer;
  user-select: none;
  touch-action: manipulation;
  border: .01rem solid transparent;
  border-color: #d9d9d9;
  background: #fff;
  border-radius: .02rem;
  box-shadow: 0 .02rem #00000004;
  color: #000000d9;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.type-pain {
    border: none;
    box-shadow: none;
    background-color: transparent;
  }

  &.size-middle {
    padding: .02rem .06rem;
    font-size: .18rem;
  }
`;

interface IProps {
  children?: ReactNode;
  type?: "pain";
  size?: "middle";
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const Button: FC<IProps> = ({ children, type, size = "middle", onClick }) => {
  const className = clsPainPattern({ type, size });
  return (
    <StyledButton className={className} onClick={onClick}>
      {children}
    </StyledButton>
  );
};

export default component<IProps>(Button);
