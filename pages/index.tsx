import { NextPage } from "next";
import { css } from "@linaria/core";
import { styled } from "@linaria/react";

const StyledHome = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #13d4d4;
`;

const Home: NextPage = () => {
  return <StyledHome>hello</StyledHome>;
};

export default Home;
