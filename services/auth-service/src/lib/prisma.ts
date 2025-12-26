/**
 * Prisma Client Singleton
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from '../config';

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: config.databaseUrl,
      },
    },
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (config.env !== 'production') {
  globalThis.prismaGlobal = prisma;
}

// Log queries in development
if (config.env === 'development') {
  prisma.$on('query' as never, (e: any) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query');
  });
}

prisma.$on('error' as never, (e: any) => {
  logger.error({ error: e }, 'Database error');
});

prisma.$on('warn' as never, (e: any) => {
  logger.warn({ warning: e }, 'Database warning');
});
