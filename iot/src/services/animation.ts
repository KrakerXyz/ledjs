import { Animator } from 'netled';

export async function useAnimation(id: string, version: number): Promise<Animator<any>> {
    return await Promise.resolve({ id, version }) as unknown as Animator<any>;
}