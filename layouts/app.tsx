import { FC } from "react";
import { styled } from "@linaria/react";

const StyledAppLayout = styled.div`
  height: 100vh;
  padding: 32px 24px;
  background-color: #f6f6f6;
  .container {
    height: 100%;
    display: flex;
    background-color: #fdfdfd;

    box-shadow: rgba(0, 0, 0, 0.25) 0px 25px 50px -12px;
    overflow: hidden;
    .aside {
      border: 1px solid #e8e8e8;
    }
    .main {
      flex: 1;
      overflow: hidden;
    }
  }
`;

interface IProps {}

const AppLayout: FC<IProps> = () => {
  return (
    <StyledAppLayout>
      <div className="container">
        <aside className="aside">
          <nav className="nav">
            <a>latest</a>
            <a>gallery</a>
          </nav>
        </aside>
        <main className="main"></main>
      </div>
    </StyledAppLayout>
  );
};

export default AppLayout;
