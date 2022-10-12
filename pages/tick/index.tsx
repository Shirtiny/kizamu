// import { FC, memo } from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import TickAppLayout from "../../layouts/TickApp";
import TickAside from "../../components/tick/Aside";
import TickMain from "../../components/tick/Main";
import { HashRouter } from "react-router-dom";

const AppLayout = dynamic(() => import("../../layouts/App"), { ssr: false });

const TickPage: NextPage = () => {
  return (
    <AppLayout>
      <HashRouter>
        <TickAppLayout Aside={<TickAside />} Main={<TickMain />} />
      </HashRouter>
    </AppLayout>
  );
};

export default TickPage;
