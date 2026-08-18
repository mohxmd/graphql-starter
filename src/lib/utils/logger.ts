import env from "@/env";

export const ansiCodes = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
  reset: "\x1b[0m",
} as const;

export const warnPrefix = `${ansiCodes.yellow}WARN${ansiCodes.reset}`;
export const infoPrefix = `${ansiCodes.cyan}INFO${ansiCodes.reset}`;
export const errorPrefix = `${ansiCodes.red}ERR${ansiCodes.reset}`;
export const debugPrefix = `${ansiCodes.magenta}DEBUG${ansiCodes.reset}`;

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = {
  debug: (message: string, meta?: Record<string, unknown> | unknown) => void;
  info: (message: string, meta?: Record<string, unknown> | unknown) => void;
  warn: (message: string, meta?: Record<string, unknown> | unknown) => void;
  error: (
    message: string,
    errorOrMeta?: Error | Record<string, unknown> | unknown
  ) => void;
};

const logLevelScores: Record<LogLevel | "silent", number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const noop = () => {};

export const createLogger = (
  logLevel: LogLevel | "silent" = env.DEBUG === "1" ? "debug" : "info"
): Logger => {
  const currentScore = logLevelScores[logLevel];
  const isProd = env.NODE_ENV === "production";

  const log = (level: LogLevel, message: string, meta?: unknown) => {
    const timestamp = new Date().toISOString();

    if (isProd) {
      // Structured JSON format for CloudWatch, Datadog, Loki, BetterStack
      const logObject: Record<string, unknown> = {
        timestamp,
        level,
        message,
      };

      if (meta instanceof Error) {
        logObject.error = {
          name: meta.name,
          message: meta.message,
          stack: meta.stack,
        };
      } else if (meta && typeof meta === "object") {
        Object.assign(logObject, meta);
      } else if (meta !== undefined) {
        logObject.data = meta;
      }

      console.log(JSON.stringify(logObject));
    } else {
      // Pretty Colored Terminal format for Local Development
      const prefixMap: Record<LogLevel, string> = {
        debug: debugPrefix,
        info: infoPrefix,
        warn: warnPrefix,
        error: errorPrefix,
      };

      const timeStr = `${ansiCodes.gray}[${timestamp.split("T")[1]?.replace("Z", "")}]${ansiCodes.reset}`;
      const prefix = prefixMap[level];

      if (meta instanceof Error) {
        console.log(
          `${timeStr} ${prefix} ${message}`,
          meta.stack || meta.message
        );
      } else if (meta !== undefined) {
        console.log(`${timeStr} ${prefix} ${message}`, meta);
      } else {
        console.log(`${timeStr} ${prefix} ${message}`);
      }
    }
  };

  return {
    debug:
      currentScore > logLevelScores.debug
        ? noop
        : (msg, meta) => log("debug", msg, meta),
    info:
      currentScore > logLevelScores.info
        ? noop
        : (msg, meta) => log("info", msg, meta),
    warn:
      currentScore > logLevelScores.warn
        ? noop
        : (msg, meta) => log("warn", msg, meta),
    error:
      currentScore > logLevelScores.error
        ? noop
        : (msg, meta) => log("error", msg, meta),
  };
};

export const logger = createLogger();
