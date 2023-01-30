import { ShLogger, css, LEVELS } from "@shirtiny/logger";
import { read } from "@shirtiny/utils/lib/file";
import versionInfo from "../../public/version.json5";
import env from "./env";

const logo =
  "data:image/png;base64,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";

const miku = "https://i.giphy.com/media/11lxCeKo6cHkJy/giphy.webp";

class CustomerLogger extends ShLogger {
  doms = (message: string, ...nodes: any[]) => {
    this.formatShapeLog(
      {
        level: 4, // the level of this log method
        title: " DOM :",
        color: "#3f6600",
      },
      message,
      [...nodes]
    );
  };

  component = (componentName: any, message: string, ...data: any[]) => {
    this.formatShapeLog(
      {
        level: 8,
        title: " COM :",
        color: "#6a51b2",
      },
      String(componentName),
      message,
      ...data
    );
  };

  customVersion = async (
    name: string,
    tag: string,
    sha: string,
    ...data: any[]
  ) => {
    const level = 0;

    const blob = await (await fetch(miku)).blob();
    const url = await read((reader) => {
      reader.readAsDataURL(blob);
    });

    this.customFormat(
      level,
      [
        {
          str: String(name).toUpperCase(),
          style: css`
            background: linear-gradient(to right, #009fff, #ec2f4b);
            color: white;
            padding: 2px 5px;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
          `,
        },
        {
          str: tag,
          style: css`
            background-color: #292f4c;
            color: white;
            padding: 2px 5px;
            margin-right: 8px;
          `,
        },
        {
          str: "REP",
          style: css`
            background-color: green;
            color: white;
            padding: 2px 5px;
            border-top-left-radius: 3px;
            border-bottom-left-radius: 3px;
          `,
        },
        {
          str: sha,
          style: css`
            background-color: #fff;
            color: #333;
            padding: 2px 5px;
            border-right: 1px solid rgba(0, 0, 0, 0.06);
          `,
        },
        // https://giphy.com/explore/console
        {
          str: " ",
          style: css`
            margin-left: 8px;
            padding: 15px;
            color: transparent;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            background-image: url(${url});
          `,
        },
      ],
      ...data
    );
  };
}

const logger = new CustomerLogger({
  level: LEVELS.debug,
  log: (...args: any[]) => {
    if (!env.isBrowser()) return;
    return console.log(...args);
  },
});

if (env.isDev()) {
  logger.setLevel(39);
}

const run = async () => {
  if (!env.isBrowser()) return;
  versionInfo &&
    (await logger.customVersion(
      versionInfo.package.name,
      versionInfo.git.lastTag,
      versionInfo.git.abbreviatedSha
    ));
  logger.log(
    "env:",
    process.env.NODE_ENV,
    " log options:",
    logger.getLoggerOption()
  );
};

run();

export default logger;
