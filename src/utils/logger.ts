import { ShLogger } from "@shirtiny/logger";

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

  component = (componentName: string, message: string,...data: any[]) => {
    this.formatShapeLog(
      {
        level: 8, 
        title: " COM :",
        color: "#6a51b2",
      },
      componentName,
      message,
      ...data
    );
  };
}

const logger = new CustomerLogger();

export default logger;
