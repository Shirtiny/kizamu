import { NextPage } from "next";
import dynamic from "next/dynamic";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const AppLayout = dynamic(() => import("../layouts/app"), { ssr: false });

const StyledHome = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #13d4d4;
`;

const Home: NextPage = () => {
  return (
    <AppLayout>
      <StyledHome></StyledHome>
    </AppLayout>
  );
};

export default Home;
