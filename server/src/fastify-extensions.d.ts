
import 'fastify';
import type { Id } from '../../core/src/index.ts';
import type { RequestServicesContainer } from './services/RequestServicesContainer.js';

declare module 'fastify' {
    interface FastifyRequest {
        user: {
            /** The id of the credential that was used. For Jwt this will be the userId but for device authentications it'll be the device id */
            sub: Id,
            deviceId?: Id | null
            userId: Id,
            jti?: string,
            authType: 'jwt' | 'device',
        },
        services: RequestServicesContainer,
    }
}