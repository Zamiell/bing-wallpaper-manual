import { makeDirectory } from "complete-node";
import path from "node:path";
import winston from "winston";
import { name } from "../package.json";
import { PROJECT_ROOT } from "./constants.js";

const LOGS_PATH = path.join(PROJECT_ROOT, "logs");
const LOG_PATH = path.join(LOGS_PATH, `${name}.log`);

await makeDirectory(LOGS_PATH);

const timeFormat = "MM/DD/YYYY hh:mm:ss A";

const prettyPrint = winston.format.printf(
  ({ level, message, timestamp, stack }) =>
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    stack
      ? // eslint-disable-next-line @typescript-eslint/no-base-to-string
        `[${timestamp}] ${level}: ${stack}`
      : `[${timestamp}] ${level}: ${message}`,
);

export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: timeFormat }),
    winston.format.errors({ stack: true }),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), prettyPrint),
    }),
    new winston.transports.File({
      filename: LOG_PATH,
      format: prettyPrint,
    }),
  ],
});
