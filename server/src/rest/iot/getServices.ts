import { RouteOptions } from 'fastify';
import { jwtAuthentication } from '../../services/jwtAuthentication.js';
import { IotServices } from '../../../../core/src/rest/model/IotServices.js';
import { EnvKey, getOptionalConfig, getRequiredConfig } from '../../services/getRequiredConfig.js';
import { NetledPrefix } from '../../../../core/src/iot/mqttTopic.js';

export const getServices: RouteOptions = {
    method: 'GET',
    url: '/api/iot/services',
    preValidation: [jwtAuthentication],
    handler: async (req, res) => {
        const services: IotServices = {
            mqtt: {
                url: getRequiredConfig(EnvKey.MqttBroker),
                prefix: getOptionalConfig(EnvKey.MqttPrefix, 'netled') as NetledPrefix,
                username: 'netled-device',
                password: 'WsE@53J+aht="D2<bAe,?>'
            }
        }
        await res.status(200).send(services);
    }
};