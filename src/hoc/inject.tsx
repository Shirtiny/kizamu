import { FC } from "react";

// inject static values to a component so that they're always provided
export default function inject<P>(
  Component: FC<P>,
  injector = (props: any) => ({})
) {
  const Func: FC<P> = (props: any) => {
    return <Component {...props} {...() => injector(props)} />;
  };
  Object.assign(Func, Component);
  Func.displayName = `${Component.displayName || Component.name}Injector`;
  return Func;
}
