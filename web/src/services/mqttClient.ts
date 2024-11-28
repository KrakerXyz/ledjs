
import mqtt from 'mqtt';
import { onUnmounted } from 'vue';
import { assertTrue } from './assert';
import { useAuthService } from './authService';

let client: mqtt.MqttClient | null = null;
let useCount = 0;

export type SubscriptionCallback = (topic: string, message: string) => void;
const globalSubscriptions: Map<string, { subCount: number }> = new Map();

export function useMqttClient() {

    useCount++;
    if (!client) {
        const mqttService = useAuthService().userServices.value?.mqtt;
        if (!mqttService) { throw new Error('Missing mqtt services'); }
        
        client = mqtt.connect('wss://dev-mqtt-ws.netled.io/mqtt', {
            clientId: mqttService.clientId,
            username: mqttService.username,
            password: mqttService.password,
            rejectUnauthorized: false,
            protocolVersion: 5,
        });

        client.on('connect', async () => {
            console.debug('Connected to mqtt');
        });
    }

    const subscriptions: Map<string, SubscriptionCallback> = new Map();
    const onMessage: mqtt.OnMessageCallback = (topic, message) => {
        const callback = subscriptions.get(topic);
        callback?.(topic, message.toString());
    }

    client.on('message', onMessage);

    onUnmounted(() => {
        useCount--;
        client?.off('message', onMessage);
        if (useCount > 0) {

            for (const sub of subscriptions.keys()) {
                const subCount = globalSubscriptions.get(sub)?.subCount ?? 0;
                if (subCount === 1) {
                    client?.unsubscribe(sub);
                    globalSubscriptions.delete(sub);
                } else {
                    globalSubscriptions.set(sub, { subCount: subCount - 1 });
                }
            }

            return;
        }
        console.debug('Disconnecting mqtt client');
        client?.end();
        client = null;
    });

    return {
        subscribe: (topic: string, callback: SubscriptionCallback) => {
            if(subscriptions.has(topic)) { throw new Error(`Already subscribed to topic ${topic}`); }
            assertTrue(client);
            subscriptions.set(topic, callback);
            const subCount = globalSubscriptions.get(topic)?.subCount ?? 0;
            globalSubscriptions.set(topic, { subCount: subCount + 1 });
            if (!subCount) {
                client.subscribe(topic);
            }
        }
    };
}