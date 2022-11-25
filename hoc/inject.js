// inject static values to a component so that they're always provided
export default function inject(Component, injector = (props) => ({})) {
  return function Injected(props) {
    return <Component {...props} {...() => injector(props)} />;
  };
}
