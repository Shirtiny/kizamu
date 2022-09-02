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
  basePath: deployEnv.basePath,
  linaria: {
    /* linaria options here */
    // displayName: true,
    classNameSlug: (hash, title) => `${title}__${hash}`,
  },
};

module.exports = withLinaria(nextConfig);
