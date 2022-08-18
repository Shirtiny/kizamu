import { NextPage } from "next";
import dynamic from "next/dynamic";
import Aside from "../components/Aside";

const AppLayout = dynamic(() => import("../layouts/app"), { ssr: false });

const Home: NextPage = () => {
  return <AppLayout Aside={<Aside />} Main={<></>}></AppLayout>;
};

export default Home;
