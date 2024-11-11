
<template>
    <div class="d-flex flex-column h-100">
        <div class="flex-grow-1 row g-0">
            <div class="col">
                <div class="h-100 d-flex flex-column">
                    <div v-for="seg of segments" :key="seg.id" :style="seg.style">
                        <Segment :segment="seg"></Segment>
                    </div>
                </div>
            </div>
            <div class="col-lg-3 p-2 d-flex flex-column">
                <div class="flex-grow-1">
                    <h3>Setup</h3>
                    <div class="form-floating">
                        <input
                            id="d-leds"
                            class="form-control"
                            placeholder="*"
                            v-model.lazy.number="strandLeds"
                        >
                        <label for="d-leds"># LEDs</label>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">

import type { Id } from '$core/rest/model/Id';
import type { ScriptVersion } from '$core/rest/model/ScriptVersion';
import { assertTrue, useAnimationRestClient, usePostProcessorRestClient } from '$src/services';
import { computed, defineComponent, getCurrentInstance, reactive, ref } from 'vue';
import Segment from './Segment.vue';
import { LedSegment } from '$src/services/animation/LedSegment';

export default defineComponent({
    components: { Segment },
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup() {
        
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const mockSegments = getMockSegments();

        const animApi = useAnimationRestClient();
        const animations = await Promise.all(
            mockSegments
                .filter(x => x.type === SegmentInputType.Animation)
                .map(x => animApi.byId(x.animation.id, x.animation.version))
        );

        const postApi = usePostProcessorRestClient();
        const postProcessors = await Promise.all(
            mockSegments
                .filter(x => x.type === SegmentInputType.PostProcess)
                .map(x => postApi.byId(x.postProcess.id, x.postProcess.version))
        );

        const strandLeds = ref(100);

        const sab = computed(() => new SharedArrayBuffer(strandLeds.value * 4));

        const segments = computed(() => {
            const leds = strandLeds.value;
            const vms = mockSegments.map<SegmentVm>((x, i) => {

                const animOrPost = x.type === SegmentInputType.Animation
                    ? animations.find(y => y.id === x.animation.id && y.version === x.animation.version)
                    : postProcessors.find(y => y.id === x.postProcess.id && y.version === x.postProcess.version);

                if (!animOrPost) { throw new Error(`${x.type} not found`); }

                const numLeds = Math.floor(leds * x.leds.percent / 100);
                const startLed = Math.floor(strandLeds.value * x.leds.offset / 100);
                const ledSegment = new LedSegment(sab.value, numLeds, startLed);
                const style = { width: `${x.leds.percent}%`, marginLeft: `${x.leds.offset}%` };
                const vm: SegmentVm = { 
                    id: i,
                    name: animOrPost.name,
                    type: x.type,
                    js: animOrPost.js,
                    style,
                    ledSegment,
                    prevLedSegment: null
                };
                return vm;
            });

            for (let i = 0; i < vms.length; i++) {
                if (!i) { continue; }
                vms[i].prevLedSegment = vms[i - 1].ledSegment;
            }

            return vms;
        });

        return { segments, strandLeds };
    }
});

// these should not be exported. Just get TS to ignore warnings for now

export interface SegmentVm {
    id: number
    name: string,
    type: SegmentInputType,
    js: string,
    style: Record<string, string>,
    ledSegment: LedSegment,
    prevLedSegment: LedSegment | null,
}

export function getMockSegments() {
    const segments: ISegment[] = reactive([]);

    segments.push({
        type: SegmentInputType.Animation,
        animation: {
            id: '3bfe1c99-c4fa-4eb2-a1c5-305d3729a35e',
            version: 'draft'
        },
        leds: {
            offset: 0,
            percent: 50
        }
    });

    segments.push({
        type: SegmentInputType.PostProcess,
        postProcess: {
            id: 'b0197fb4-8645-4738-b2bc-e51a57170f99',
            version: 'draft'
        },
        leds: {
            offset: 0,
            percent: 100
        }
    });
    return segments;
}

export enum SegmentInputType {
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
