
import 'fastify';
import type { Id } from '../../core/src/index.ts';
import type { RequestServicesContainer } from './services/RequestServicesContainer.js';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            sub: Id,
            jti?: string,
        },
        services: RequestServicesContainer,
    }
}