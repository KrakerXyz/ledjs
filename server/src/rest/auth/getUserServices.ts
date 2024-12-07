
import { UserServices } from '../../../../core/src/rest/AuthRestClient.js';
import { Id } from '../../../../core/src/rest/model/Id.js';
import { getRequiredConfig, EnvKey, getOptionalConfig } from '../../services/getRequiredConfig.js';

export function getUserServices(userId: Id): UserServices {
    return {
        mqtt: {
            url: getRequiredConfig(EnvKey.MqttBrokerWs),
            username: 'netled-client',
            password: getRequiredConfig(EnvKey.MqttUserPassword),
            clientId: `netled${getOptionalConfig(EnvKey.MqttEnv)}-ui:${userId}`,
            prefix: `netled${getOptionalConfig(EnvKey.MqttEnv, '')}`,
        }
    };
}