import { Logger } from "@tsed/logger";
import { isProduction } from "../config";
import { hostname } from "os";

export const initLogging = () => {
  const logger = new Logger(hostname());
  const layout = isProduction
    ? {
        type: "json"
      }
    : undefined;

  logger.appenders
    .set("stdout", {
      type: "stdout",
      levels: ["trace", "debug", "info", "warn"],
      layout
    })
    .set("stderr", {
      type: "stderr",
      levels: ["fatal", "error"],
      layout
    });

  return logger;
};
