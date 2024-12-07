import mqtt from 'mqtt';
import { mqttTopic, NetledPrefix, Topic } from '../../../core/src/iot/mqttTopic.js';
import { EnvKey, getOptionalConfig } from './getRequiredConfig.js';



export class MqttClient {

    private static _instance: MqttClient | null = null;
    private _client: mqtt.MqttClient | null = null;
    private readonly _prefix: NetledPrefix;

    private constructor(client: mqtt.MqttClient) {
        MqttClient._instance = this;
        this._client = client;
        this._prefix = `netled${getOptionalConfig(EnvKey.MqttEnv, '')}`;
    }

    public publish(topic: Topic): void;
    public publish(topic: Topic, message: string): void;
    public publish(topic: Topic, message?: string): void {
        if (!this._client) { throw new Error('MqttClient not connected'); }

        this._client.publish(mqttTopic(`${this._prefix}/${topic}`), message ?? '');
    }

    public static createClient(broker: string): Promise<MqttClient> {
        if (MqttClient._instance) { throw new Error('MqttClient already created'); }

        return new Promise<MqttClient>((resolve, reject) => {
            const client = mqtt.connect(broker, {
                clientId: `netled${getOptionalConfig(EnvKey.MqttEnv)}-server`,
                username: 'netled-server',
                password: 'Nru5.`^D2ktHC3z+p-g[X$',
                rejectUnauthorized: false,
                protocolVersion: 5
            });

            const timeout = setTimeout(() => {
                client.end();
                reject(new Error('Timeout connecting to mqtt'));
            }, 5000);

            client.on('connect', () => {
                clearTimeout(timeout);
                console.log('Connected to mqtt');
                resolve(new MqttClient(client));
            });
        });

    }

}