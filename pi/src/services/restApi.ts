import { AnimationRestClient } from '../../../core/src/rest/AnimationRestClient.js';
import { DeviceRestClient } from '../../../core/src/rest/DeviceRestClient.js';
import { IotRestClient } from '../../../core/src/rest/IotRestClient.js';
import { PostProcessorRestClient } from '../../../core/src/rest/PostProcessorRestClient.js';
import { RestClient } from '../../../core/src/rest/RestClient.js';
import { ScriptConfigRestClient } from '../../../core/src/rest/ScriptConfigRestClient.js';
import { StrandRestClient } from '../../../core/src/rest/StrandRestClient.js';
import { EnvKey, getRequiredConfig } from './getRequiredConfig.js';

let restClient: RestClient | null = null;

function createRestClient() {
    return restClient ?? (restClient = new RestClient({
        baseUrl: getRequiredConfig(EnvKey.LEDJS_HOST) as any,
        authorization: `device ${getRequiredConfig(EnvKey.LEDJS_AUTH)}`,
    }));
}

let deviceRestClient: DeviceRestClient | null = null;
let strandRestClient: StrandRestClient | null = null;
let animationRestClient: AnimationRestClient | null = null;
let postProcessorRestClient: PostProcessorRestClient | null = null;
let iotRestClient: IotRestClient | null = null;
let scriptConfigRestClient: ScriptConfigRestClient | null = null;

export const restApi = {
    get devices() { return deviceRestClient ?? (deviceRestClient = new DeviceRestClient(createRestClient())); },
    get strands() { return strandRestClient ?? (strandRestClient = new StrandRestClient(createRestClient())); },
    get animations() { return animationRestClient ?? (animationRestClient = new AnimationRestClient(createRestClient())); },
    get postProcessors() { return postProcessorRestClient ?? (postProcessorRestClient = new PostProcessorRestClient(createRestClient())); },
    get iot() { return iotRestClient ?? (iotRestClient = new IotRestClient(createRestClient())); },
    get scriptConfigs() { return scriptConfigRestClient ?? (scriptConfigRestClient = new ScriptConfigRestClient(createRestClient())); },
}