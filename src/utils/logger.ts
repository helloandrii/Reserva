/**
 * Structured logger. Wraps console for easy swap to Sentry/Datadog later.
 * In production, set LOG_LEVEL=error to silence debug/info.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL: LogLevel = __DEV__ ? 'debug' : 'warn';

const LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function shouldLog(level: LogLevel): boolean {
    return LEVELS[level] >= LEVELS[LOG_LEVEL];
}

export const logger = {
    debug: (tag: string, message: string, ...args: unknown[]) => {
        if (shouldLog('debug')) console.debug(`[${tag}] ${message}`, ...args);
    },
    info: (tag: string, message: string, ...args: unknown[]) => {
        if (shouldLog('info')) console.info(`[${tag}] ${message}`, ...args);
    },
    warn: (tag: string, message: string, ...args: unknown[]) => {
        if (shouldLog('warn')) console.warn(`[${tag}] ${message}`, ...args);
    },
    error: (tag: string, message: string, ...args: unknown[]) => {
        if (shouldLog('error')) console.error(`[${tag}] ${message}`, ...args);
        // TODO: report to Sentry: Sentry.captureException(args[0])
    },
};
