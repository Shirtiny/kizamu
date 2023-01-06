/** @type {import('next').NextConfig} */

const { withSentryConfig } = require("@sentry/nextjs");

const { DEPLOY_ENV, NODE_ENV } = process.env;

const isProduction = NODE_ENV === "production";

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
  experimental: {
    appDir: true,
  },
  compiler: {
    // removeConsole: isProduction
    //   ? {
    //       exclude: ["log", "error"],
    //     }
    //   : false,
    styledComponents: {
      displayName: true,
      fileName: false,
    },
  },
  reactStrictMode: true,
  images: {
    // loader: "akamai",
    // path: "",
  },
  sentry: {
    // Use `hidden-source-map` rather than `source-map` as the Webpack `devtool`
    // for client-side builds. (This will be the default starting in
    // `@sentry/nextjs` version 8.0.0.) See
    // https://webpack.js.org/configuration/devtool/ and
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/#use-hidden-source-map
    // for more information.
    hideSourceMaps: true,
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

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  autoInstrumentServerFunctions: false,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
