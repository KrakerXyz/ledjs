import { Id } from '../rest/model/Id.js';

export type NetledPrefix = `netled${string}`;

export type DeviceTopicAction =
    'strand-changed' // sent by server when device.strandId has been updated
    | 'is-running' // sent by server when device.isRunning has been updated
export type DeviceTopic = `device/${Id}/${DeviceTopicAction}`;

export type AnimationTopic = `animation/${Id}/updated`;
export type PostProcessorTopic = `post-processor/${Id}/updated`;
export type ScriptConfigTopic = `script-config/${Id}/updated`;

export type StrandTopic = `strand/${Id}/updated`;

export type StatusTopic = `status/${Id}` // sent by devices

export type Topic = DeviceTopic | AnimationTopic | PostProcessorTopic | ScriptConfigTopic | StrandTopic | StatusTopic;
export type TopicWithPrefix = `${NetledPrefix}/${Topic}`;

export function mqttTopic<T extends TopicWithPrefix>(topic: T): T {
    return topic;
}