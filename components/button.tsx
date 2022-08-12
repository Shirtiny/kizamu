import { FC, memo, ReactNode } from "react";
import { styled } from "@linaria/react";
import { clsPainPattern } from "@shirtiny/utils/lib/style";

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
  border: 1px solid transparent;
  border-color: #d9d9d9;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 2px #00000004;
  color: #000000d9;
  font-weight: 400;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);

  &.type-pain {
    border: none;
    box-shadow: none;
    background-color: transparent;
  }

  &.size-middle {
    padding: 0.125rem 0.375rem;
    font-size: 1.125rem;
  }
`;

interface IProps {
  children?: ReactNode;
  type?: "pain";
  size?: "middle";
}

const Button: FC<IProps> = ({ children, type, size = "middle" }) => {
  const className = clsPainPattern({ type, size });
  return <StyledButton className={className}>{children}</StyledButton>;
};

export default memo(Button);
