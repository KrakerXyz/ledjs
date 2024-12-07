
import { connect, IClientPublishOptions, MqttClient } from 'mqtt';
import { NetledPrefix, Topic, TopicWithPrefix } from '../../../core/src/iot/mqttTopic.js';
import { IDisposable } from '../../../core/src/Disposable.js';
import { getLogger } from './logger.js';

export class Mqtt {

    private readonly _logger = getLogger('Mqtt');

    private constructor(private readonly _client: MqttClient, private readonly _prefix: NetledPrefix) { 
        _client.on('message', (topic, message) => {
            const cbs = this._subscriptions.get(topic as TopicWithPrefix);
            if (!cbs) {
                this._logger.warn(`Received message for unregistered topic: ${topic}`);
                return;
            }

            cbs.forEach(cb => cb(message.toString()));
        });
    }

    private static _instance: Mqtt | null = null;
    
    public static async connect(url: string, username: string, password: string, clientId: string, prefix: NetledPrefix) {
        const client = connect(url, {
            clientId,
            username: username,
            password: password,
            rejectUnauthorized: false,
            protocolVersion: 5
        });

        await new Promise<void>((resolve, reject) => {
            client.on('error', (err: any) => {
                reject(err);
            });

            client.on('connect', () => {
                resolve();
            });
        });

        const mqtt = new Mqtt(client, prefix);
        this._instance = mqtt;
        return mqtt;
    }

    public static instance() {
        if(!this._instance) {
            throw new Error('Mqtt not connected');
        }
        return this._instance;
    }

    public publish(topic: Topic, message: string, options?: IClientPublishOptions) {
        this._client.publish(`${this._prefix}/${topic}`, message, options);
    }

    private readonly _subscriptions: Map<TopicWithPrefix, ((c: string) => void)[]> = new Map();
    public async subscribeAsync(topic2: Topic, cb: (data: string) => void, options?: { qos: 0 | 1 | 2 }): Promise<IDisposable> {
        const fullTopic: TopicWithPrefix = `${this._prefix}/${topic2}`;
        const dispose: IDisposable ={
            dispose: () => {
                const cbs = this._subscriptions.get(fullTopic);
                if(!cbs) { throw new Error('Subscription not found'); }
                const i = cbs.indexOf(cb);
                if(i === -1) { throw new Error('Callback not found'); }
                cbs.splice(i, 1);

                if(cbs.length === 0) {
                    this._subscriptions.delete(fullTopic);
                    this._client.unsubscribe(fullTopic);
                }
            }
        };

        const cbs = this._subscriptions.get(fullTopic);
        if (cbs) {
            cbs.push(cb);
            return dispose;
        }

        this._subscriptions.set(fullTopic, [cb]);
        await this._client.subscribeAsync(fullTopic, options);
        return dispose;
    }
}
