
import { UserServices } from '../../../../core/src/rest/AuthRestClient.js';
import { Id } from '../../../../core/src/rest/model/Id.js';
import { getRequiredConfig, EnvKey } from '../../services/getRequiredConfig.js';

export function getUserServices(userId: Id): UserServices {
    return {
        mqtt: {
            url: getRequiredConfig(EnvKey.MqttBrokerWs),
            username: 'netled-client',
            password: 'rx&[v"guP}M*-:2J)@FAV5',
            clientId: `netled-ui:${userId}`,
        }
    };
}