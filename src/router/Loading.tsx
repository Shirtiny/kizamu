import { FC, memo, useEffect } from "react";
import nprogress from "nprogress";

const RouterLoading: FC = () => {
  useEffect(() => {
    nprogress.start();

    return () => {
      nprogress.done();
    };
  });
  return <>loading</>;
};

export default memo(RouterLoading);
