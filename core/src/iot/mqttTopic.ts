import { Id } from '../rest/model/Id.js';

export type DeviceTopic = `netled/device/${Id}/${'strand-changed' | 'stop' | 'run'}`;

export type AnimationTopic = `netled/animation/${Id}/updated`;

export type Topic = DeviceTopic | AnimationTopic;

export function mqttTopic<T extends Topic>(topic: T): T {
    return topic;
}