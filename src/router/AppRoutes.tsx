import { FC,  Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { IRoute } from "./type";
import RouterLoading from "./Loading";
import component from "@/hoc/component";

interface IProps {
  routes: IRoute[];
  routeComponentProps?: Object;
}

const AppRoutes: FC<IProps> = ({
  routes,
  routeComponentProps = {},
}) => {
  return (
    <Suspense fallback={<RouterLoading />}>
      <Routes>
        {routes.map((r) => {
          const Component = r.Component;

          return (
            <Route
              key={r.key}
              path={r.path}
              element={!!Component && <Component {...routeComponentProps} />}
            />
          );
        })}
      </Routes>
    </Suspense>
  );
};

export default component<IProps>(AppRoutes);
