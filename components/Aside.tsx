import { styled } from "@linaria/react";
import { FC, memo } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { VscGithubInverted, VscTwitter } from "react-icons/vsc";
import Button from "./common/Button";
import Icon from "./common/Icon";
import ActiveBar from "./ActiveBar";

interface IStyledAsideProps {}

const StyledAside = styled.div<IStyledAsideProps>`
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 0.0625rem solid #e8e8e8;
  padding: 3.125rem 0 4.375rem;
  .menu {
    text-align: center;
  }
  .nav {
    position: relative;
    flex: 1;
    margin: 4.375rem 0;
    text-align: center;
    overflow-y: auto;
    .nav-item {
      position: relative;
      cursor: pointer;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      height: 4.6875rem;
      width: 4.6875rem;
      transform: rotate(-90deg);
      color: #8b8b8b;
      letter-spacing: 0.0625rem;
      font-family: "Lexend", sans-serif;
      text-transform: capitalize;
      /* &::first-letter {
        text-transform: uppercase;
      } */
      &:not(:last-child) {
        margin-bottom: 2rem;
      }
      &.active {
        color: #ff7576;
      }
      &.dot {
        &::before {
          display: block;
          content: "";
          position: absolute;
          top: 38%;
          right: 0.5rem;
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
          background-color: #ff7576;
        }
      }
    }
  }
  .links {
    display: flex;
    flex-direction: column;
    text-align: center;
    & > :not(:last-child) {
      margin-bottom: 1.5rem;
    }
  }
`;

const Aside: FC = () => {
  return (
    <StyledAside>
      <div className="menu">
        <Button type="pain">
          <Icon
            Svg={<HiOutlineMenuAlt2 style={{ transform: "rotateX(180deg)" }} />}
          />
        </Button>
      </div>
      <nav className="nav">
        <a className="nav-item active">latest</a>
        <a className="nav-item">gallery</a>
        <a className="nav-item dot">news</a>
        <ActiveBar />
      </nav>
      <div className="links">
        <Button type="pain">
          <Icon size="middle" Svg={<VscGithubInverted />} />
        </Button>
        <Button type="pain">
          <Icon size="large" Svg={<VscTwitter />} />
        </Button>
      </div>
    </StyledAside>
  );
};

export default memo(Aside);
