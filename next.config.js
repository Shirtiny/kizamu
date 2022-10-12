/** @type {import('next').NextConfig} */

const withLinaria = require("next-linaria");

const { DEPLOY_ENV } = process.env;

const deployEnvs = {
  DEFAULT: {
    basePath: "",
  },
  VERCEL: {
    basePath: "",
  },
  GITHUB: {
    basePath: "/kizamu",
  },
};

const deployEnv = deployEnvs[DEPLOY_ENV || "DEFAULT"];

console.log("Deploy Env: ", deployEnv);

const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
  },
  linaria: {
    /* linaria options here */
    // displayName: true,
    classNameSlug: (hash, title) => `${title}__${hash}`,
  },
  basePath: deployEnv.basePath,
  async redirects() {
    return [
      {
        source: "/",
        destination: "/tick#/latest",
        permanent: false,
      },
      {
        // does not add /docs since basePath: false is set
        source: "/without-basePath",
        destination: "/another",
        basePath: false,
        permanent: false,
      },
    ];
  },
};

module.exports = withLinaria(nextConfig);
