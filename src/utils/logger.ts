type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (import.meta.env.DEV) {
      const consoleMethod = level === 'error' ? console.error :
                           level === 'warn' ? console.warn :
                           level === 'info' ? console.info :
                           console.debug;

      consoleMethod(`[${level.toUpperCase()}]`, message, data || '');
    }
  }

  error(message: string, error?: unknown) {
    this.log('error', message, error);
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  }

  debug(message: string, data?: unknown) {
    this.log('debug', message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

export const logger = new Logger();
