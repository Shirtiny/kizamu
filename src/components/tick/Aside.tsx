import { FC } from "react";
import styled from "styled-components";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { VscGithubInverted, VscTwitter } from "react-icons/vsc";
import Button from "../common/Button";
import Icon from "../common/Icon";
import Navbar from "./Navbar";
import component from "@/hoc/component";

interface IStyledAsideProps {}
const StyledAside = styled.div<IStyledAsideProps>`
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 0.01rem solid #e8e8e8;
  padding: 0.5rem 0 0.7rem;
  .menu {
    text-align: center;
  }

  .links {
    display: flex;
    flex-direction: column;
    text-align: center;
    & > :not(:last-child) {
      margin-bottom: 0.24rem;
    }
  }
`;

interface IProps {}

const TickAside: FC<IProps> = () => {
  return (
    <StyledAside>
      <div className="menu">
        <Button type="pain">
          <Icon
            Svg={<HiOutlineMenuAlt2 style={{ transform: "rotateX(180deg)" }} />}
          />
        </Button>
      </div>
      <Navbar />
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

export default component<IProps>(TickAside);
