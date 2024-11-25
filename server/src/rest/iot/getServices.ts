import { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import { IotServices } from '../../../../core/src/rest/model/IotServices.js';
import { EnvKey, getRequiredConfig } from '../../services/getRequiredConfig.js';

export const getServices: RouteOptions = {
    method: 'GET',
    url: '/api/iot/services',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const services: IotServices = {
            mqtt: getRequiredConfig(EnvKey.MqttBroker)
        }
        await res.status(200).send(services);
    }
};