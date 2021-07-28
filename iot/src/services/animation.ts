import { AnimationClient, Animator } from 'netled';
import { useRestClient } from '.';

export async function useAnimation(id: string, version: number): Promise<Animator<any>> {
    const restClient = useRestClient();
    const animationClient = new AnimationClient(restClient);
    const module = await animationClient.importScriptById(id, version);
    return new module();
}