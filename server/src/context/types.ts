export type LogPayload = Record<string, string | null | undefined> | undefined | null;

type LogFn = (message: string, payload?: LogPayload) => void;

export interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
  silent: LogFn;
}
