import { FC, memo, useLayoutEffect, useEffect } from "react";
import logger from "@/utils/logger";

interface IOptions {
  memorize?: boolean;
}

const defaultOptions = {
  memorize: true,
};

export default function component<P>(
  Component: FC<P>,
  options: IOptions = defaultOptions
) {
  const { memorize } = options;
  const Func: FC<P> = (props) => {
    useLayoutEffect(() => {
      logger.component(Component.name, "useLayoutEffect");
    }, []);

    useEffect(() => {
      logger.component(Component.name, "useEffect", {
        ["process.env"]: process.env,
      });
    }, []);

    return <Component {...props} />;
  };
  Object.assign(Func, Component);
 
  Func.displayName = `${Component.displayName || Component.name}Wrapper`;
  return memorize ? memo(Func) : Func;
}
