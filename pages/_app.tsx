import "../styles/globals.css";
import type { AppProps } from "next/app";
import { IconContext } from "react-icons/lib";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <IconContext.Provider value={{ className: "react-icon", style: {} }}>
      <Component {...pageProps} />
    </IconContext.Provider>
  );
}

export default MyApp;
