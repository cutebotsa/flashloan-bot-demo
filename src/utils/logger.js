const winston = require('winston');
const path = require('path');
const config = require('../config');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize } = format;

// Ensure logs directory exists
const { ensureDirSync } = require('fs-extra');
const logDir = path.dirname(config.logging.file);
ensureDirSync(logDir);

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  const metaString = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${message}${metaString}`;
});

// Create logger instance
const logger = createLogger({
  level: config.logging.level,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.splat(),
    format.json()
  ),
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(timestamp(), logFormat)
    }),
    // Write all logs to combined.log
    new transports.File({ 
      filename: config.logging.file,
      format: combine(timestamp(), logFormat)
    })
  ]
});

// If we're not in production, also log to the console
if (config.logging.console) {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      logFormat
    )
  }));
}

// Create a stream object with a 'write' function that will be used by morgan
logger.stream = {
  write: (message) => {
    // Use the 'info' log level so the output will be picked up by both transports
    logger.info(message.trim());
  },
};

module.exports = logger;
