const isBrowser = () => {
  return typeof window !== "undefined";
};

const isDev = () => {
  return process.env.NODE_ENV === "development";
};

const env = {
  isBrowser,
  isDev,
};

export default env;
