
<template>
    <div>
        <div v-for="(s, index) of segments" :key="index" class="row">
            <div class="col">
                Segment
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import { defineComponent, reactive } from 'vue';
import { Id, AnimationVersion } from '@krakerxyz/netled-core';

export default defineComponent({
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    setup() {

        const segments: ISegment[] = reactive([]);

        segments.push({
            input: {
                type: SegmentInputType.Animation,
                animation: {
                    id: '3bfe1c99-c4fa-4eb2-a1c5-305d3729a35e',
                    version: 'draft'
                }
            },
            leds: {
                percent: 50
            }
        });

        segments.push({
            input: {
                type: SegmentInputType.PostProcess,
                input: segments[0],
                postProcess: {
                    id: 'reverse' as Id,
                    version: 'draft'
                }
            },
            leds: {
                percent: 50
            }
        });

        return { segments };
    }
});

enum SegmentInputType {
    Animation = 'animation',
    PostProcess = 'postProcess'
}

type ISegmentInput = {
    type: SegmentInputType.Animation,
    animation: {
        id: Id,
        version: AnimationVersion
    }
    configId?: Id, 
}
| {
    type: SegmentInputType.PostProcess,
    input: ISegmentInput | ISegment,
    postProcess: {
        id: Id,
        version: AnimationVersion
    }
}

interface ISegment {
    input: ISegmentInput,
    leds: {
        percent: number,
        maxLeds?: number,
    }
}

</script>
