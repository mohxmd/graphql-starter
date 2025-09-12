import env from "@/env";

export const ansiCodes = {
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
} as const;

export const warnPrefix = `${ansiCodes.yellow}WARN${ansiCodes.reset}`;
export const infoPrefix = `${ansiCodes.cyan}INFO${ansiCodes.reset}`;
export const errorPrefix = `${ansiCodes.red}ERR${ansiCodes.reset}`;
export const debugPrefix = `${ansiCodes.magenta}DEBUG${ansiCodes.reset}`;

export type LogLevel = "debug" | "info" | "warn" | "error";

export type Logger = Record<LogLevel, (...args: unknown[]) => void>;

const logLevelScores: Record<LogLevel | "silent", number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

const noop = () => {};

const consoleLog =
  (prefix: string) =>
  (...args: Array<unknown>) =>
    console.log(prefix, ...args);

const debugLog = console.debug
  ? (...args: Array<unknown>) => console.debug(debugPrefix, ...args)
  : consoleLog(debugPrefix);
const infoLog = console.info
  ? (...args: Array<unknown>) => console.info(infoPrefix, ...args)
  : consoleLog(infoPrefix);
const warnLog = console.warn
  ? (...args: Array<unknown>) => console.warn(warnPrefix, ...args)
  : consoleLog(warnPrefix);
const errorLog = console.error
  ? (...args: Array<unknown>) => console.error(errorPrefix, ...args)
  : consoleLog(errorPrefix);

export const createLogger = (
  logLevel: LogLevel | "silent" = env.DEBUG === "1" ? "debug" : "info"
): Logger => {
  const score = logLevelScores[logLevel];
  return {
    debug: score > logLevelScores.debug ? noop : debugLog,
    info: score > logLevelScores.info ? noop : infoLog,
    warn: score > logLevelScores.warn ? noop : warnLog,
    error: score > logLevelScores.error ? noop : errorLog,
  };
};

export const logger = createLogger();
