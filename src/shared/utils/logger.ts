/**
 * Centralized Logging Utility
 * Provides consistent logging across the application
 */

import { config } from '../../core/config/env.config';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private logLevel: LogLevel;
  private enableConsole: boolean;

  constructor() {
    this.logLevel = this.getLogLevel(config.logging.level);
    this.enableConsole = config.logging.enableConsole;
  }

  private getLogLevel(level: string): LogLevel {
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG;
      case 'info':
        return LogLevel.INFO;
      case 'warn':
        return LogLevel.WARN;
      case 'error':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, context?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.DEBUG) && this.enableConsole) {
      console.log(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.INFO) && this.enableConsole) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, error?: Error | Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.WARN) && this.enableConsole) {
      const context = error instanceof Error ? { error: error.message, stack: error.stack } : error;
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorStr = error ? ` | Error: ${error.message}` : '';
      const fullMessage = this.formatMessage('error', message, context) + errorStr;

      if (this.enableConsole) {
        console.error(fullMessage);
        if (error?.stack) {
          console.error('Stack trace:', error.stack);
        }
      }
    }
  }
}

export const logger = new Logger();
export default logger;
