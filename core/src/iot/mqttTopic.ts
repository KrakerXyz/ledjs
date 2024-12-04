import { Id } from '../rest/model/Id.js';

export type NetledPrefix = `netled${string}`;

export type DeviceTopicAction =
    'strand-changed' // sent by server when device.strandId has been updated
    | 'is-running' // sent by server when device.isRunning has been updated
export type DeviceTopic = `${NetledPrefix}/device/${Id}/${DeviceTopicAction}`;

export type AnimationTopic = `${NetledPrefix}/animation/${Id}/updated`;

export type StrandTopicAction = 'updated';
export type StrandTopic = `${NetledPrefix}/strand/${Id}/${StrandTopicAction}`;

export type StatusTopic = `${NetledPrefix}/status/${Id}` // sent by devices

export type Topic = DeviceTopic | AnimationTopic | StrandTopic | StatusTopic;

export function mqttTopic<T extends Topic>(topic: T): T {
    return topic;
}