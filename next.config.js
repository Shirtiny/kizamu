/** @type {import('next').NextConfig} */

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

const deployEnv = deployEnvs[DEPLOY_ENV || "DEFAULT"]

const nextConfig = {
  reactStrictMode: true,
  images: {
    loader: "akamai",
    path: "",
  },
  basePath: deployEnv.basePath,
};

module.exports = nextConfig;
