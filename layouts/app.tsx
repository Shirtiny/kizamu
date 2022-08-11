import { FC } from "react";
import { styled } from "@linaria/react";
import Button from "../components/button";
import Icon from "../components/icon";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { GoMarkGithub } from "react-icons/go";

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

interface IProps {}

const AppLayout: FC<IProps> = () => {
  return (
    <StyledAppLayout>
      <div className="container">
        <aside className="aside">
          <div className="menu">
            <Button type="pain">
              <Icon
                Svg={
                  <HiOutlineMenuAlt2 style={{ transform: "rotateX(180deg)" }} />
                }
              />
            </Button>
          </div>
          <div className="flex-space"></div>
          <nav className="nav">
            {/* <a>latest</a>
            <a>gallery</a> */}
          </nav>
          <div className="flex-space"></div>
          <div className="links">
            <Button type="pain">
              <Icon size="large" Svg={<GoMarkGithub />} />
            </Button>
          </div>
        </aside>
        <main className="main"></main>
      </div>
    </StyledAppLayout>
  );
};

export default AppLayout;
