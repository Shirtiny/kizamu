'use client';
import { lazy } from "react";
import { IRoute } from "./type";

const tick: IRoute[] = [
  {
    key: "latest",
    path: "/latest",
    label: "latest",
    Component: lazy(() => import("../app/tick/Latest")),
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
    Component: lazy(() => import("../components/RichTextEditor/Editor")),
  },
];

const routerConfig = { tick };

export default routerConfig;
