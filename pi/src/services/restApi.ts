import { DeviceRestClient } from '../../../core/src/rest/DeviceRestClient.js';
import { RestClient } from '../../../core/src/rest/RestClient.js';
import { EnvKey, getRequiredConfig } from './getRequiredConfig.js';

const restClient = new RestClient({
    baseUrl: getRequiredConfig(EnvKey.LEDJS_HOST) as any,
    authorization: `device ${getRequiredConfig(EnvKey.LEDJS_AUTH)}`,
});

export const restApi = {
    devices: new DeviceRestClient(restClient)    
}