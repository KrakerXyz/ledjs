
import 'fastify';
import { Id } from '@krakerxyz/netled-core';
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