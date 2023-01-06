'use client';
// import { FC, memo } from "react";
import { HashRouter } from "react-router-dom";
import { NextPage } from "next";
import TickAppLayout from "../../layouts/TickApp";
import TickAside from "../../components/tick/Aside";
import AppRoutes from "../../router/AppRoutes";
import routerConfig from "../../router/config";

const TickPage: NextPage = () => {
  return (
    <HashRouter>
      <TickAppLayout
        Aside={<TickAside />}
        Main={<AppRoutes routes={routerConfig.tick} />}
      />
    </HashRouter>
  );
};

export default TickPage;
