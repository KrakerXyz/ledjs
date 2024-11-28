
import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT from '@fastify/jwt';
import path from 'path';
import { getSchemaValidator } from './db/schema/schemaUtility.js';
import fastifyStatic from '@fastify/static';
import { apiRoutes } from './rest/index.js';
import { getRequiredConfig, EnvKey } from './services/getRequiredConfig.js';

import { fileURLToPath } from 'url';
import { configureDbLocal } from './db/Db.js';
import { RequestServicesContainer } from './services/RequestServicesContainer.js';
import { MqttClient } from './services/MqttClient.js';
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

console.log('Configuring db');
console.log(getRequiredConfig(EnvKey.DbConnectionString));
configureDbLocal({
    dbName: 'netled-dev',
    uri: getRequiredConfig(EnvKey.DbConnectionString)
});

console.log('Initializing Fastify');

const server = fastify({
    logger: {
        level: 'trace',
        transport: process.env.NODE_ENV === 'development' ? {
            target: 'pino-pretty',
            options: {
                translateTime: 'SYS:h:MM:ss TT Z o',
                colorize: true,
                ignore: 'pid,hostname'
            }
        } : undefined
    },
});

server.setValidatorCompiler(req => {
    if (!req.httpPart) {
        throw new Error('Missing httpPart');
    }
    const validator = getSchemaValidator(req.httpPart as any, req.schema);
    if (!validator) {
        throw new Error(`Missing validator for ${req.httpPart}`);
    }

    return validator;
});

console.log('Creating mqtt client');
const mqttClient = await MqttClient.createClient(getRequiredConfig(EnvKey.MqttBroker));

server.decorateRequest('services', { getter: () => new RequestServicesContainer(mqttClient) });


server.register(fastifyJWT, {
    secret: getRequiredConfig(EnvKey.JwtSecret),
    cookie: {
        cookieName: 'jwt',
        signed: false
    }
});

server.register(fastifyCookie);

const webPath = path.join(__dirname, '../../', '.web');
server.register(fastifyStatic, {
    root: webPath,
    immutable: true,
    maxAge: '1d',
    // setHeaders: res => {
    //     res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    //     res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
    // }
});

apiRoutes.forEach(r => server.route(r));


server.setNotFoundHandler({}, async (req, res) => {
    if (req.method !== 'GET') {
        await res.status(404).send();
        return;
    }
    if (req.url.startsWith('/api')) {
        await res.status(404).send();
        return;
    }
    await res.headers({
        // Required to use SharedArrayBuffer
        'Cross-Origin-Opener-Policy': 'same-origin',
        'Cross-Origin-Embedder-Policy': 'require-corp'
    }).sendFile('index.html');
});

server.ready(() => {
    server.log.info('Fastify ready');
});

const start = async () => {
    try {
        await server.listen({ port: 3001, host: '::' });
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();