import { deepClone } from '$core/services/deepClone.js';
import { Id } from './Id.js';
import { ScriptVersion } from './ScriptVersion.js';

export enum SegmentInputType {
    Animation = 'animation',
    PostProcess = 'postProcess'
}

export interface Strand {
    readonly id: Id,
    name: string,
    description: string,
    numLeds: number,
    segments: Segment[],
    readonly created: number,
    readonly author: Id,
}

interface SegmentBase {
    type: SegmentInputType,
    readonly id: Id,
    leds: {
        offset: number,
        num: number,
    },
}

interface AnimationSegment extends SegmentBase {
    type: SegmentInputType.Animation,
    script: {
        id: Id,
        version: ScriptVersion,
        configId?: Id,
    },
    leds: SegmentBase['leds'] & {
        dead?: (number | `${number}-${number}`)[],
    }
}

interface PostProcessSegment extends SegmentBase {
    type: SegmentInputType.PostProcess,
    script: {
        id: Id,
        version: ScriptVersion,
    }
}

export type Segment = AnimationSegment | PostProcessSegment;

export type StrandPost = Omit<Strand, 'author' | 'created'>;

export function strandToPost(strand: Strand): StrandPost {
    return deepClone({
        id: strand.id,
        name: strand.name,
        description: strand.description,
        numLeds: strand.numLeds,
        segments: strand.segments
    });
}