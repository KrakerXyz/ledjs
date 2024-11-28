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
                env: getOptionalConfig(EnvKey.MqttEnv) as NetledPrefix,
                username: 'netled-device',
                password: getRequiredConfig(EnvKey.MqttIotPassword),
            }
        }
        await res.status(200).send(services);
    }
};