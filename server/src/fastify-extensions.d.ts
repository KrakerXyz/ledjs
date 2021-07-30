
import 'fastify';
import { RequestUser } from './services';

declare module 'fastify' {
    interface FastifyRequest {
        user: RequestUser
    }
}