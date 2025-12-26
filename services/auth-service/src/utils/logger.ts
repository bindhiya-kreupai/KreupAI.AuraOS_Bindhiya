/**
 * Pino Logger Configuration
 */

import pino from 'pino';
import { config } from '../config';

export const logger = pino({
  level: config.log.level,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  transport: config.log.pretty
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: config.datadog.service,
    env: config.env,
    version: config.datadog.version,
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err,
  },
});
