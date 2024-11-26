import { NetledPrefix } from "../../iot/mqttTopic.js";

export interface IotServices {
    /** Connection string for mqtt */
    mqtt: string,
    /** String to prefix all topics with */
    mqttPrefix: NetledPrefix,
}