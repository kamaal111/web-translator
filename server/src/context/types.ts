type LogFn = (message: string, payload?: Record<string, string>) => void;

export interface Logger {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  debug: LogFn;
}
