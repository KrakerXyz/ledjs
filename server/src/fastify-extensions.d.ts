
import 'fastify';
import { RequestServicesContainer } from './services';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            sub: string,
            jti?: string
        },
        services: RequestServicesContainer
    }
}