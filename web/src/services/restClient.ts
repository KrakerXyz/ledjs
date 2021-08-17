
import { AnimationRestClient, DeviceRestClient, RestClient, RestConfig } from 'netled';

let restClient: RestClient | undefined;
export function useRestClient(): RestClient {
    return restClient ?? (restClient = new RestClient({ origin: window.location.origin as RestConfig['origin'] }));
}

let animationClient: AnimationRestClient | undefined;
export function useAnimationRestClient(): AnimationRestClient {
    return animationClient ?? (animationClient = new AnimationRestClient(useRestClient()));
}

let devicesClient: DeviceRestClient | undefined;
export function useDevicesRestClient(): DeviceRestClient {
    return devicesClient ?? (devicesClient = new DeviceRestClient(useRestClient()));
}