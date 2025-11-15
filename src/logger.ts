import { makeDirectory } from "complete-node";
import path from "node:path";
import { pino } from "pino";
import { name } from "../package.json";
import { PROJECT_ROOT } from "./constants.js";

const LOGS_PATH = path.join(PROJECT_ROOT, "logs");
const LOG_PATH = path.join(LOGS_PATH, `${name}.log`);

await makeDirectory(LOGS_PATH);

const options = {
  ignore: "hostname,pid",
  translateTime: "HH:MM:ss TT",
};

const customTimestamp = () => {
  const time = new Date().toLocaleString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: "America/New_York",
  });

  return `,"time":"${time}"`;
};

export const logger = pino({
  timestamp: customTimestamp,
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options,
      },
      {
        target: "pino-pretty",
        options: {
          ...options,
          destination: LOG_PATH,
          colorize: false,
        },
      },
    ],
  },
});
