/**
 * Simple Logger for FinanzApp
 * Shows colored, structured logs so you can actually see what's happening.
 */

const LOG_LEVELS = {
  DEBUG: { label: 'DEBUG', color: '\x1b[36m' },   // cyan
  INFO:  { label: 'INFO',  color: '\x1b[32m' },   // green
  WARN:  { label: 'WARN',  color: '\x1b[33m' },   // yellow
  ERROR: { label: 'ERROR', color: '\x1b[31m' },   // red
};

const RESET = '\x1b[0m';

function formatLog(level, context, message, data) {
  const time = new Date().toLocaleTimeString('de-DE');
  const prefix = `[${time}] [${level.label}] [${context}]`;

  if (data !== undefined) {
    console.log(`${level.color}${prefix}${RESET} ${message}`, data);
  } else {
    console.log(`${level.color}${prefix}${RESET} ${message}`);
  }
}

const logger = {
  debug: (context, message, data) => formatLog(LOG_LEVELS.DEBUG, context, message, data),
  info:  (context, message, data) => formatLog(LOG_LEVELS.INFO, context, message, data),
  warn:  (context, message, data) => formatLog(LOG_LEVELS.WARN, context, message, data),
  error: (context, message, data) => formatLog(LOG_LEVELS.ERROR, context, message, data),
};

export default logger;
