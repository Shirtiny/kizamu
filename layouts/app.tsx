import { FC, ReactNode } from "react";
import { styled } from "@linaria/react";

const StyledAppLayout = styled.div`
  :global() {
    html {
      font-size: 16px;
    }
    html,
    body {
      padding: 0;
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
        Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    * {
      box-sizing: border-box;
    }

    .flex-space {
      flex: 1;
    }
  }

  height: 100vh;
  padding: 2rem 1.5rem;
  background-color: #f6f6f6;

  .container {
    height: 100%;
    display: flex;
    background-color: #fdfdfd;
    box-shadow: rgba(0, 0, 0, 0.25) 0rem 1.5625rem 3.125rem -0.75rem;
    overflow: hidden;

    .aside {
      display: flex;
      flex-direction: column;
      width: 6.25rem;
      border: 0.0625rem solid #e8e8e8;
      padding: 32px 0;
      .menu {
        text-align: center;
      }
      .nav {
      }
      .links {
      }
    }

    .main {
      flex: 1;
      overflow: hidden;
    }
  }
`;

interface IChildren {
  (params: { asideClassName: string; mainClassName: string }): ReactNode;
}

interface IProps {
  Aside?: ReactNode;
  Main?: ReactNode;
  children?: IChildren;
}

const AppLayout: FC<IProps> = ({ Aside, Main, children }) => {
  return (
    <StyledAppLayout>
      <div className="container">
        <aside className="aside">{Aside}</aside>
        <div className="main">{Main}</div>
      </div>
    </StyledAppLayout>
  );
};

export default AppLayout;
