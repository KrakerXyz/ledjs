
<template>
    <div>
        <div v-for="(s, index) of segmentVms" :key="index" class="row">
            <div class="col">
                {{s.inputName}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import type { ScriptVersion } from '$core/rest/model/ScriptVersion';
import { useAnimationRestClient } from '$src/services';
import { defineComponent, reactive } from 'vue';

export default defineComponent({
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup() {

        const animationApi = useAnimationRestClient();
        const animations = await animationApi.list();

        const segments = getMockSegments();

        const segmentVms = segments.map(s => {
            let inputName = 'UNK';
            const input = s.input;
            if (input.type === SegmentInputType.Animation) {
                inputName = animations.find(x => x.id === input.animation.id)?.name ?? 'UNK';
            }
            const vm: SegmentVm = {
                segment: s,
                inputName
            };
            return vm;
        });

        return { segmentVms };
    }
});

interface SegmentVm {
    segment: ISegment,
    inputName: string,
}

function getMockSegments() {
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
    return segments;
}

enum SegmentInputType {
    Animation = 'animation',
    PostProcess = 'postProcess'
}

type ISegmentInput = {
    type: SegmentInputType.Animation,
    animation: {
        id: Id,
        version: ScriptVersion,
    },
    configId?: Id, 
}
| {
    type: SegmentInputType.PostProcess,
    input: ISegmentInput | ISegment,
    postProcess: {
        id: Id,
        version: ScriptVersion,
    },
}

interface ISegment {
    input: ISegmentInput,
    leds: {
        percent: number,
        maxLeds?: number,
    },
}

</script>
