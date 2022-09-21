
import { AnimationRestClient, DeviceRestClient, PostProcessorRestClient, RestClient, RestConfig } from '@krakerxyz/netled-core';

let restClient: RestClient | undefined;
export function useRestClient(): RestClient {
    return restClient ?? (restClient = new RestClient({ baseUrl: window.location.origin as RestConfig['baseUrl'] }));
}

let animationClient: AnimationRestClient | undefined;
export function useAnimationRestClient(): AnimationRestClient {
    return animationClient ?? (animationClient = new AnimationRestClient(useRestClient()));
}

let postProcessorClient: PostProcessorRestClient | undefined;
export function usePostProcessorRestClient(): PostProcessorRestClient {
    return postProcessorClient ?? (postProcessorClient = new PostProcessorRestClient(useRestClient()));
}

let devicesClient: DeviceRestClient | undefined;
export function useDevicesRestClient(): DeviceRestClient {
    return devicesClient ?? (devicesClient = new DeviceRestClient(useRestClient()));
}