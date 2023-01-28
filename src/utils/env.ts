const isBrowser = () => {
  return typeof window !== "undefined";
};

const env = {
  isBrowser,
};

export default env;
