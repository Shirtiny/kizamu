import { FC } from "react";

// inject static values to a component so that they're always provided
export default function inject<P>(
  Component: FC<P>,
  injector = (props: any) => ({})
) {
  return ((props: any) => {
    return <Component {...props} {...() => injector(props)} />;
  }) as FC<P>;
}
