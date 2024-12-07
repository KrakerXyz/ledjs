import { NetledPrefix } from '../../iot/mqttTopic.js';

export interface IotServices {
    mqtt: {
        /** Broker url */
        url: string,
        username: string,
        password: string,
        prefix: NetledPrefix,
    }
}