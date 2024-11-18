import { AnimationRestClient } from '../../../core/src/rest/AnimationRestClient.js';
import { DeviceRestClient } from '../../../core/src/rest/DeviceRestClient.js';
import { PostProcessorRestClient } from '../../../core/src/rest/PostProcessorRestClient.js';
import { RestClient } from '../../../core/src/rest/RestClient.js';
import { StrandRestClient } from '../../../core/src/rest/StrandRestClient.js';
import { EnvKey, getRequiredConfig } from './getRequiredConfig.js';

const restClient = new RestClient({
    baseUrl: getRequiredConfig(EnvKey.LEDJS_HOST) as any,
    authorization: `device ${getRequiredConfig(EnvKey.LEDJS_AUTH)}`,
});

export const restApi = {
    devices: new DeviceRestClient(restClient),
    strands: new StrandRestClient(restClient),
    animations: new AnimationRestClient(restClient),
    postProcessors: new PostProcessorRestClient(restClient),
}