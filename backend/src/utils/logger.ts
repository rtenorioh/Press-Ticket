import pino from "pino";

const logger = pino({
  prettyPrint: {
    ignore: "pid,hostname"
  },
  level: "trace"
});

export { logger };