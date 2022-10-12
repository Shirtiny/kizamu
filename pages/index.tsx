import { NextPage } from "next";
import dynamic from "next/dynamic";

const AppLayout = dynamic(() => import("../layouts/App"), { ssr: false });

const Home: NextPage = () => {
  return <AppLayout></AppLayout>;
};

export default Home;
