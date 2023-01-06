import { FC, memo, ReactNode } from "react";
import styled from "styled-components";;


const StyledTickAppLayout = styled.div`
  height: 100vh;
  padding: 2rem 1.5rem;
  background-color: var(--color-primary-background-color-dark);
  transition: background-color 0.4s ease-in-out;

  .container {
    height: 100%;
    display: flex;
    background-color: var(--color-primary-background-color);
    transition: background-color 0.4s ease-in-out;
    box-shadow: rgba(0, 0, 0, 0.25) 0rem 1.5625rem 3.125rem -0.75rem;
    overflow: hidden;

    .aside {
      width: 6.25rem;
    }

    .main {
      flex: 1;
      overflow: hidden;
    }
  }
`;

interface IProps {
  Aside?: ReactNode;
  Main?: ReactNode;
}

const TickAppLayout: FC<IProps> = ({ Aside, Main }) => {
  return (
    <StyledTickAppLayout>
      <div className="container">
        <aside className="aside">{Aside}</aside>
        <div className="main">{Main}</div>
      </div>
    </StyledTickAppLayout>
  );
};

export default memo(TickAppLayout);
