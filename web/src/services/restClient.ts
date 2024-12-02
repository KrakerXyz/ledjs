import { AnimationRestClient } from '$core/rest/AnimationRestClient.js';
import { AuthRestClient } from '$core/rest/AuthRestClient.js';
import { DeviceRestClient } from '$core/rest/DeviceRestClient.js';
import { PostProcessorRestClient } from '$core/rest/PostProcessorRestClient.js';
import { RestClient, type RestConfig } from '$core/rest/RestClient.js';
import { ScriptConfigRestClient } from '$core/rest/ScriptConfigRestClient';
import { StrandRestClient } from '$core/rest/StrandRestClient.js';

let restClient: RestClient | undefined;
let animationClient: AnimationRestClient | undefined;
let postProcessorClient: PostProcessorRestClient | undefined;
let devicesClient: DeviceRestClient | undefined;
let strandsClient: StrandRestClient | undefined;
let authClient: AuthRestClient | undefined;
let scriptConfigsClient: ScriptConfigRestClient | undefined;

export const restApi = {
    get restClient() { return restClient ?? (restClient = new RestClient({ baseUrl: window.location.origin as RestConfig['baseUrl'] })) },
    get animations() { return animationClient ?? (animationClient = new AnimationRestClient(restApi.restClient)) },
    get postProcessors() { return postProcessorClient ?? (postProcessorClient = new PostProcessorRestClient(restApi.restClient)) },
    get strands() { return strandsClient ?? (strandsClient = new StrandRestClient(restApi.restClient)) },
    get devices() { return devicesClient ?? (devicesClient = new DeviceRestClient(restApi.restClient)) },
    get auth() { return authClient ?? (authClient = new AuthRestClient(restApi.restClient)) },
    get scriptConfigs() { return scriptConfigsClient ?? (scriptConfigsClient = new ScriptConfigRestClient(restApi.restClient)) },
};