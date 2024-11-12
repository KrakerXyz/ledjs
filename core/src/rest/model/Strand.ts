import { Id } from './Id.js';
import { ScriptVersion } from './ScriptVersion.js';

export enum SegmentInputType {
    Animation = 'animation',
    PostProcess = 'postProcess'
}

export interface Strand {
    readonly id: Id,
    readonly created: number,
    readonly author: Id,
    segments: Segment[],
}

interface SegmentBase {
    readonly id: Id,
    script: {
        type: SegmentInputType,
        id: Id,
        version: ScriptVersion,
    },
    leds: {
        offset: number,
        percent: number,
    },
}

interface AnimationSegment extends SegmentBase {
    script: {
        type: SegmentInputType,
        id: Id,
        version: ScriptVersion,
        configId?: Id,
    }
}

interface PostProcessSegment extends SegmentBase {
    script: {
        type: SegmentInputType,
        id: Id,
        version: ScriptVersion,
    }
}

export type Segment = AnimationSegment | PostProcessSegment;

export type StrandPost = Omit<Strand, 'author' | 'created'>;