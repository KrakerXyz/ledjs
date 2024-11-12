import { AnimationRestClient } from '$core/rest/AnimationRestClient';
import { DeviceRestClient } from '$core/rest/DeviceRestClient';
import { PostProcessorRestClient } from '$core/rest/PostProcessorRestClient';
import { RestClient, type RestConfig } from '$core/rest/RestClient';
import { StrandRestClient } from '$core/rest/StrandRestClient';



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

let strandsClient: StrandRestClient | undefined;
export function useStrandRestClient(): StrandRestClient {
    return strandsClient ?? (strandsClient = new StrandRestClient(useRestClient()));
}