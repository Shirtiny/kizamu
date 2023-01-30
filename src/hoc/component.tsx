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
  const componentName = Component.displayName || Component.name;
  const Func: FC<P> = (props) => {
    useLayoutEffect(() => {
      logger.component(componentName, "useLayoutEffect");
    }, []);

    useEffect(() => {
      logger.component(componentName, "useEffect");
    }, []);

    return <Component {...props} />;
  };
  Object.assign(Func, Component);

  Func.displayName = `${componentName}Wrapper`;
  return memorize ? memo(Func) : Func;
}
