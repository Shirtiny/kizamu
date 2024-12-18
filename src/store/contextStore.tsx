import type { ComponentType, ReactNode } from "react";
import { createContext, useContext } from "react";

const EMPTY: unique symbol = Symbol();

export interface ContextStoreProviderProps<State = void> {
  initialState?: State;
  children?: any;
}

export interface ContextStore<Value, State = void> {
  Provider: ComponentType<ContextStoreProviderProps<State>>;
  use: () => Value;
}

function createContextStore<Value, State = void>(
  useHook: (initialState?: State) => Value
): ContextStore<Value, State> {
  const TempContext = createContext<Value | typeof EMPTY>(EMPTY);

  function Provider(props: ContextStoreProviderProps<State>) {
    const value = useHook(props.initialState);

    return (
      <TempContext.Provider value={value}>
        {props.children ?? null}
      </TempContext.Provider>
    );
  }

  function use(): Value {
    const value = useContext(TempContext);
    if (value === EMPTY) {
      throw new Error("Component must be wrapped with <Store.Provider>");
    }
    return value;
  }

  return { Provider, use };
}

function useContextStore<Value, State = void>(
  store: ContextStore<Value, State>
): Value {
  return store.use();
}

export { useContextStore };

export default createContextStore;
