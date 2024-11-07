
<template>
    <div>
        <div v-for="(s, index) of segmentVms" :key="index" class="row">
            <div class="col">
                {{s.name}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import type { ScriptVersion } from '$core/rest/model/ScriptVersion';
import { useAnimationRestClient, usePostProcessorRestClient } from '$src/services';
import { defineComponent, reactive } from 'vue';

export default defineComponent({
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup() {

        const animationApi = useAnimationRestClient();
        const animations = await animationApi.list();

        const postProcessorApi = usePostProcessorRestClient();
        const postProcesses = await postProcessorApi.list();

        const segments = getMockSegments();

        const numLeds = 100;

        const segmentVms = segments.map(s => {
            const vm: SegmentVm = {
                segment: s,
                name: '',
                offset: `${s.leds.offset}%`,
                width: `${s.leds.percent}%`,
                startLed: Math.floor(numLeds * s.leds.offset / 100),
                endLed: Math.floor(numLeds * (s.leds.offset + s.leds.percent) / 100),
            };

            if (s.type === SegmentInputType.Animation) {
                const anim = animations.find(x => x.id === s.animation.id);
                if (!anim) { throw new Error(`Animation with id ${s.animation.id} not found`); }
                vm.name = anim.name;
            } else if (s.type === SegmentInputType.PostProcess) {
                const post = postProcesses.find(x => x.id === s.postProcess.id);
                if (!post) { throw new Error(`PostProcess with id ${s.postProcess.id} not found`); }
                vm.name = post.name;
            }
            return vm;
        });

        console.log('segmentVms', segmentVms);

        return { segmentVms };
    }
});

interface SegmentVm {
    segment: ISegment,
    name: string,
    offset: string,
    width: string,
    startLed: number,
    endLed: number,
}

function getMockSegments() {
    const segments: ISegment[] = reactive([]);

    segments.push({
        type: SegmentInputType.Animation,
        animation: {
            id: '3bfe1c99-c4fa-4eb2-a1c5-305d3729a35e',
            version: 'draft'
        },
        leds: {
            offset: 0,
            percent: 100
        }
    });

    segments.push({
        type: SegmentInputType.PostProcess,
        postProcess: {
            id: 'd947c0a8-adec-4f5e-8b89-10281a7659bf',
            version: 'draft'
        },
        leds: {
            offset: 50,
            percent: 50
        }
    });
    return segments;
}

enum SegmentInputType {
    Animation = 'animation',
    PostProcess = 'postProcess'
}

type ISegment = {
    type: SegmentInputType.Animation,
    animation: {
        id: Id,
        version: ScriptVersion,
    },
    configId?: Id,
    leds: {
        offset: number,
        percent: number,
    }, 
}
| {
    type: SegmentInputType.PostProcess,
    postProcess: {
        id: Id,
        version: ScriptVersion,
    },
    leds: {
        offset: number,
        percent: number,
    }, 
}

</script>
