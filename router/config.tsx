import { lazy } from "react";
import { IRoute } from "./type";

const tick: IRoute[] = [
  {
    key: "latest",
    path: "/latest",
    label: "latest",
    Component: lazy(() => import("../components/tick/Latest")),
  },
  {
    key: "gallery",
    path: "/gallery",
    label: "gallery",
  },
  {
    key: "news",
    path: "/news",
    label: "news",
  },
];

const routerConfig = { tick };

export default routerConfig;