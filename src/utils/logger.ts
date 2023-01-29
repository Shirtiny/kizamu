import versionInfo from "../../public/version.json5";
import { ShLogger, css, LEVELS } from "@shirtiny/logger";
import env from "./env";

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

  customVersion = (name: string, tag: string, sha: string, ...data: any[]) => {
    const level = 4;
    this.customFormat(
      level,
      [
        {
          str: name,
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
          `,
        },
        {
          str: " " + sha,
          style: css``,
        },
      ],
      ...data
    );
  };
}

const logger = new CustomerLogger({
  level: LEVELS.debug,
});

if (env.isDev()) {
  logger.setLevel(8);
}

versionInfo &&
  logger.customVersion(
    versionInfo.package.name,
    versionInfo.git.lastTag,
    versionInfo.git.abbreviatedSha
  );

export default logger;
