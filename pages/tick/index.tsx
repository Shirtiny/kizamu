// import { FC, memo } from "react";
import { HashRouter } from "react-router-dom";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import TickAppLayout from "../../layouts/TickApp";
import TickAside from "../../components/tick/Aside";
import AppRoutes from "../../router/AppRoutes";
import routerConfig from "../../router/config";

const AppLayout = dynamic(() => import("../../layouts/App"), { ssr: false });

const TickPage: NextPage = () => {
  return (
    <AppLayout>
      <HashRouter>
        <TickAppLayout
          Aside={<TickAside />}
          Main={<AppRoutes routes={routerConfig.tick} />}
        />
      </HashRouter>
    </AppLayout>
  );
};

export default TickPage;
