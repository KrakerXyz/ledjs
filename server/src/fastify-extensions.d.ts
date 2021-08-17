
import 'fastify';
import { Id } from 'netled';
import { RequestServicesContainer } from './services';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            sub: Id,
            jti?: string
        },
        services: RequestServicesContainer
    }
}