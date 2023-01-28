"use client";

import AppRoutes from "@/router/AppRoutes";
import routerConfig from "@/router/config";

const TickPage = () => {
  return <AppRoutes routes={routerConfig.tick} />;
};

export default TickPage;
