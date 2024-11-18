import { AnimationRestClient } from '$core/rest/AnimationRestClient';
import { AuthRestClient } from '$core/rest/AuthRestClient';
import { DeviceRestClient } from '$core/rest/DeviceRestClient';
import { PostProcessorRestClient } from '$core/rest/PostProcessorRestClient';
import { RestClient, type RestConfig } from '$core/rest/RestClient';
import { StrandRestClient } from '$core/rest/StrandRestClient';

let restClient: RestClient | undefined;
let animationClient: AnimationRestClient | undefined;
let postProcessorClient: PostProcessorRestClient | undefined;
let devicesClient: DeviceRestClient | undefined;
let strandsClient: StrandRestClient | undefined;
let authClient: AuthRestClient | undefined;

export const restApi = {
    get restClient() { return restClient ?? (restClient = new RestClient({ baseUrl: window.location.origin as RestConfig['baseUrl'] })) },
    get animations() { return animationClient ?? (animationClient = new AnimationRestClient(restApi.restClient)) },
    get postProcessors() { return postProcessorClient ?? (postProcessorClient = new PostProcessorRestClient(restApi.restClient)) },
    get strands() { return strandsClient ?? (strandsClient = new StrandRestClient(restApi.restClient)) },
    get devices() { return devicesClient ?? (devicesClient = new DeviceRestClient(restApi.restClient)) },
    get auth() { return authClient ?? (authClient = new AuthRestClient(restApi.restClient)) },
};