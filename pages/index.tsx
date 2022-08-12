import { styled } from "@linaria/react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { FC } from "react";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { VscGithubInverted, VscTwitter } from "react-icons/vsc";
import Button from "../components/button";
import Icon from "../components/icon";

const AppLayout = dynamic(() => import("../layouts/app"), { ssr: false });

const Aside: FC = () => {
  return (
    <>
      <div className="menu">
        <Button type="pain">
          <Icon
            Svg={<HiOutlineMenuAlt2 style={{ transform: "rotateX(180deg)" }} />}
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
          <Icon size="large" Svg={<VscGithubInverted />} />
        </Button>
        <Button type="pain">
          <Icon size="large" Svg={<VscTwitter />} />
        </Button>
      </div>
    </>
  );
};

const StyledHome = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #13d4d4;
`;

const Home: NextPage = () => {
  return <AppLayout Aside={<Aside />} Main={<></>}></AppLayout>;
};

export default Home;
