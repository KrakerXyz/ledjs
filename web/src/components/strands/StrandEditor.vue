
<template>
    <div class="d-flex flex-column h-100">
        <div class="flex-grow-1 row g-0">
            <div class="col">
                <div class="h-100 d-flex flex-column">
                    <div style="margin-left: 0%; width: 50%">
                        <Segment name="Anim: Rainbow" :sab="sab" :num-leds="numLeds"></Segment>
                    </div>
                    <div style="margin-left: 00%; width: 100%">
                        <Segment name="Post: Copy" :sab="sab" :num-leds="numLeds"></Segment>
                    </div>
                    <div style="margin-left: 50%; width: 50%">
                        <Segment name="Post: Reverse" :sab="sab" :num-leds="numLeds"></Segment>
                    </div>
                    <div style="width: 100%">
                        <Segment name="FINAL" :sab="sab" :num-leds="numLeds"></Segment>
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
                            v-model.lazy.number="numLeds"
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
import { assertTrue } from '$src/services';
import { computed, defineComponent, getCurrentInstance, reactive, ref } from 'vue';
import Segment from './Segment.vue';

export default defineComponent({
    components: { Segment },
    props: {
        strandId: { type: String as () => Id, required: true }
    },
    async setup() {
        
        const componentInstance = getCurrentInstance();
        assertTrue(componentInstance);

        const numLeds = ref(100);

        const sab = computed(() => new SharedArrayBuffer(numLeds.value * 4));

        return { numLeds, sab };
    }
});

// these should not be exported. Just get TS to ignore warnings for now

export interface SegmentVm {
    segment: ISegment,
    name: string,
    offset: string,
    width: string,
    startLed: number,
    endLed: number,
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
