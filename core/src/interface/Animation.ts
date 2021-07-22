
export interface Animation {
    id: string;
    name: string;
    version: number;
    created: number;
    author: string;
    script: string;
}

export type AnimationMeta = Omit<Animation, 'script'>;

export type AnimationPost = Pick<Animation, 'script' | 'id'>;