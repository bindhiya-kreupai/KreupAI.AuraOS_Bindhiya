
import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

/**
 * Create Prisma client with query monitoring
 */
function createPrismaClient(): PrismaClient {
    const client = new PrismaClient({
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' },
            { emit: 'event', level: 'warn' },
        ],
    });

    // Performance monitoring middleware
    client.$use(async (params, next) => {
        const startTime = Date.now();

        try {
            const result = await next(params);
            const duration = Date.now() - startTime;

            // Log slow queries (>100ms)
            if (duration > 100) {
                const query = `${params.model}.${params.action}`;
                console.warn(
                    `[SLOW QUERY] ${query} took ${duration}ms`,
                    JSON.stringify(params.args).substring(0, 200)
                );
            }

            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            console.error(
                `[QUERY ERROR] ${params.model}.${params.action} failed after ${duration}ms:`,
                error
            );
            throw error;
        }
    });

    // Track query events in development
    if (process.env.NODE_ENV === 'development') {
        client.$on('query' as never, (e: Prisma.QueryEvent) => {
            if (e.duration > 50) {
                // Log queries slower than 50ms in dev
                console.log(`[QUERY] ${e.query.substring(0, 100)}... (${e.duration}ms)`);
            }
        });
    }

    // Track errors
    client.$on('error' as never, (e: Prisma.LogEvent) => {
        console.error('[PRISMA ERROR]', e.message);
    });

    // Track warnings
    client.$on('warn' as never, (e: Prisma.LogEvent) => {
        console.warn('[PRISMA WARNING]', e.message);
    });

    return client;
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from '@prisma/client';
