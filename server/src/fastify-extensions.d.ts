
import 'fastify';
import { Id } from '../../core/src/index.ts';
import { RequestServicesContainer } from './services/RequestServicesContainer.js';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            sub: Id,
            jti?: string
        },
        services: RequestServicesContainer
    }
}